import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

import Phaser from 'phaser';
import { LEVEL_3 } from '../levels/level-3';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements AfterViewInit, OnDestroy {

  @ViewChild('gameContainer', { static: true })
  gameContainer!: ElementRef<HTMLDivElement>;

  private game?: Phaser.Game;

  ngAfterViewInit(): void {

    // Egy mező mérete pixelben
    const tileSize = 120;

    // A labirintus
    //
    // S = Start
    // P = járható mező (Path)
    // X = akadály
    // C = Cél
    const level = LEVEL_3;

    const maze = level.maze;

    const config: Phaser.Types.Core.GameConfig = {

      type: Phaser.AUTO,

      width: tileSize * 4,

      // +120 pixel a visszajelzéseknek
      height: tileSize * 4 + 120,

      parent: this.gameContainer.nativeElement,

      backgroundColor: '#222222',

      scene: {

        create: function () {

          /*
           * -------------------------
           * JÁTÉK ÁLLAPOTA
           * -------------------------
           */

          let playerRow = 0;
          let playerColumn = 0;

          let steps = 0;
          let mistakes = 0;

          let gameFinished = false;


          /*
           * -------------------------
           * SZÖVEGES VISSZAJELZÉSEK
           * -------------------------
           */

          const statusText = this.add.text(
            10,
            tileSize * 4 + 10,
            `${level.name} – ${level.difficulty}`,
            {
              fontSize: '20px',
              color: '#ffffff'
            }
          );

          const statsText = this.add.text(
            10,
            tileSize * 4 + 50,
            'Lépések: 0 | Hibák: 0',
            {
              fontSize: '18px',
              color: '#ffffff'
            }
          );


          /*
           * -------------------------
           * MEZŐK TÁROLÁSA
           * -------------------------
           *
           * Erre azért van szükség,
           * hogy később módosítani
           * tudjuk az adott mező
           * színét.
           */

          const tileObjects:
            Phaser.GameObjects.Rectangle[][] = [];


          /*
           * -------------------------
           * IDEIGLENES JÁTÉKOSJELÖLŐ
           * -------------------------
           *
           * Ez később NEM feltétlenül
           * lesz része a végleges
           * projektoros játéknak.
           *
           * Fejlesztés közben azt
           * mutatja, hogy a rendszer
           * szerint melyik mezőn áll
           * a gyermek.
           */

          const player = this.add.container(
            tileSize / 2,
            tileSize / 2
          );

          // A mezők fölött jelenjen meg
          player.setDepth(10);

          // Test
          const playerBody = this.add.circle(
            0,
            10,
            24,
            0x0066ff
          );

          // Fej
          const playerHead = this.add.circle(
            0,
            -18,
            14,
            0xffd6a5
          );

          player.add([
            playerBody,
            playerHead
          ]);


          /*
           * -------------------------
           * STATISZTIKA FRISSÍTÉSE
           * -------------------------
           */

          const updateStats = () => {

            statsText.setText(
              `Lépések: ${steps} | Hibák: ${mistakes}`
            );

          };


          /*
           * -------------------------
           * MOZGÁS FELDOLGOZÁSA
           * -------------------------
           *
           * FONTOS:
           *
           * Ezt hívja most:
           *
           * - az egérkattintás
           * - a billentyűzet
           *
           * Később pedig ugyanezt
           * fogja meghívni az ESP32
           * által küldött szenzoradat.
           */

          const tryMove = (
            rowIndex: number,
            columnIndex: number
          ) => {

            // Ha már vége a játéknak,
            // ne lehessen tovább lépni.
            if (gameFinished) {
              return;
            }

            const tile =
              maze[rowIndex][columnIndex];


            /*
             * Ellenőrizzük,
             * hogy szomszédos mező-e.
             */

            const rowDistance =
              Math.abs(
                rowIndex - playerRow
              );

            const columnDistance =
              Math.abs(
                columnIndex - playerColumn
              );

            const isNeighbour =
              rowDistance +
              columnDistance === 1;


            /*
             * -------------------------
             * NEM SZOMSZÉDOS MEZŐ
             * -------------------------
             */

            if (!isNeighbour) {

              mistakes++;

              statusText.setText(
                '❌ Csak szomszédos mezőre léphetsz!'
              );

              updateStats();

              return;
            }


            /*
             * -------------------------
             * AKADÁLY
             * -------------------------
             */

            if (tile === 'X') {

              mistakes++;

              statusText.setText(
                '❌ Ez akadály!'
              );

              updateStats();

              const obstacle =
                tileObjects[rowIndex][columnIndex];

              // Röviden pirosra vált
              obstacle.setFillStyle(
                0xff3333
              );

              // Majd visszaáll
              this.time.delayedCall(
                400,
                () => {

                  obstacle.setFillStyle(
                    0x555555
                  );

                }
              );

              return;
            }


            /*
             * -------------------------
             * HELYES LÉPÉS
             * -------------------------
             */

            playerRow = rowIndex;
            playerColumn = columnIndex;

            steps++;

            updateStats();


            /*
             * Az ideiglenes bábu
             * az új mezőre kerül.
             *
             * NINCS animáció.
             */

            player.setPosition(
              playerColumn * tileSize +
                tileSize / 2,

              playerRow * tileSize +
                tileSize / 2
            );


            /*
             * A bejárt mezőt
             * kékre színezzük.
             */

            tileObjects[rowIndex][columnIndex]
              .setFillStyle(
                0x66ccff
              );


            statusText.setText(
              '✅ Ügyes! Jó lépés.'
            );


            /*
             * -------------------------
             * CÉLBA ÉRÉS
             * -------------------------
             */

            if (tile === 'C') {

              gameFinished = true;

              statusText.setText(
                `🎉 Célba értél! Lépések: ${steps}, hibák: ${mistakes}`
              );

              // A bábu teste zöld lesz
              playerBody.setFillStyle(
                0x00ff00
              );

            }

          };


          /*
           * -------------------------
           * LABIRINTUS KIRAJZOLÁSA
           * -------------------------
           */

          maze.forEach(
            (row, rowIndex) => {

              tileObjects[rowIndex] = [];

              row.forEach(
                (tile, columnIndex) => {

                  const x =
                    columnIndex * tileSize +
                    tileSize / 2;

                  const y =
                    rowIndex * tileSize +
                    tileSize / 2;


                  let color = 0xffffff;
                  let label = '';


                  /*
                   * START
                   */

                  if (tile === 'S') {

                    color = 0x66cc66;
                    label = 'START';

                  }


                  /*
                   * CÉL
                   */

                  if (tile === 'C') {

                    color = 0xffcc00;
                    label = 'CÉL';

                  }


                  /*
                   * AKADÁLY
                   */

                  if (tile === 'X') {

                    color = 0x555555;
                    label = 'X';

                  }


                  /*
                   * MEZŐ LÉTREHOZÁSA
                   */

                  const rectangle =
                    this.add.rectangle(
                      x,
                      y,
                      tileSize - 4,
                      tileSize - 4,
                      color
                    );


                  rectangle.setStrokeStyle(
                    2,
                    0x000000
                  );


                  /*
                   * Eltároljuk a mezőt.
                   */

                  tileObjects[rowIndex]
                    [columnIndex] =
                      rectangle;


                  /*
                   * Kattinthatóvá tesszük.
                   */

                  rectangle.setInteractive();


                  /*
                   * -------------------------
                   * EGÉRKATTINTÁS
                   * -------------------------
                   */

                  rectangle.on(
                    'pointerdown',
                    () => {

                      tryMove(
                        rowIndex,
                        columnIndex
                      );

                    }
                  );


                  /*
                   * -------------------------
                   * FELIRAT
                   * -------------------------
                   */

                  if (label) {

                    this.add.text(
                      x,
                      y,
                      label,
                      {
                        fontSize: '18px',

                        color:
                          tile === 'X'
                            ? '#ffffff'
                            : '#000000'
                      }
                    )
                    .setOrigin(0.5);

                  }

                }
              );

            }
          );


          /*
           * -------------------------
           * BILLENTYŰZETES
           * SZENZORSZIMULÁCIÓ
           * -------------------------
           *
           * A billentyűk a 4×4-es
           * padlómezőket szimulálják:
           *
           * 1  2  3  4
           * Q  W  E  R
           * A  S  D  F
           * Z  X  C  V
           */

          const keyMap:
            Record<string, [number, number]> = {

              ONE: [0, 0],
              TWO: [0, 1],
              THREE: [0, 2],
              FOUR: [0, 3],

              Q: [1, 0],
              W: [1, 1],
              E: [1, 2],
              R: [1, 3],

              A: [2, 0],
              S: [2, 1],
              D: [2, 2],
              F: [2, 3],

              Z: [3, 0],
              X: [3, 1],
              C: [3, 2],
              V: [3, 3]

            };


          /*
           * Billentyűfigyelők
           * létrehozása.
           */

          Object.entries(keyMap)
            .forEach(
              ([keyName, position]) => {

                const key =
                  this.input.keyboard
                    ?.addKey(keyName);

                key?.on(
                  'down',
                  () => {

                    const [row, column] =
                      position;

                    tryMove(
                      row,
                      column
                    );

                  }
                );

              }
            );


          /*
           * -------------------------
           * ÚJRAKEZDÉS GOMB
           * -------------------------
           */

          const restartButton =
            this.add.text(
              320,
              tileSize * 4 + 50,
              '🔄 Újrakezdés',
              {
                fontSize: '18px',
                color: '#ffffff',

                backgroundColor:
                  '#444444',

                padding: {
                  x: 10,
                  y: 6
                }
              }
            )
            .setInteractive({
              useHandCursor: true
            });


          restartButton.on(
            'pointerdown',
            () => {

              this.scene.restart();

            }
          );

        }
      }
    };


    /*
     * -------------------------
     * PHASER INDÍTÁSA
     * -------------------------
     */

    this.game =
      new Phaser.Game(config);

  }


  /*
   * -------------------------
   * PHASER LEÁLLÍTÁSA
   * -------------------------
   */

  ngOnDestroy(): void {

    this.game?.destroy(true);

  }

}