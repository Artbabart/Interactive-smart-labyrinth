import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';

import Phaser from 'phaser';

import { Level } from '../levels/level.model';
import { LEVEL_1 } from '../levels/level-1';


@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements AfterViewInit, OnDestroy {

  @Input() level: Level = LEVEL_1;

  @ViewChild('gameContainer', { static: true })
  gameContainer!: ElementRef<HTMLDivElement>;

  private game?: Phaser.Game;


  ngAfterViewInit(): void {

    const tileSize = 120;

    const level = this.level;

    const maze = level.maze;


    const config: Phaser.Types.Core.GameConfig = {

      type: Phaser.AUTO,

      width: tileSize * 4,

      height: tileSize * 4 + 160,

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

          let gameStarted = false;
          let gameFinished = false;

          let startTime = 0;
          let elapsedSeconds = 0;


          /*
           * -------------------------
           * PÁLYA NEVE
           * -------------------------
           */

          const levelText = this.add.text(
            10,
            tileSize * 4 + 5,
            `${level.name} – ${level.difficulty}`,
            {
              fontSize: '18px',
              color: '#ffcc00'
            }
          );


          /*
           * -------------------------
           * STÁTUSZ
           * -------------------------
           */

          const statusText = this.add.text(
            10,
            tileSize * 4 + 35,
            '⏳ A játék még nem indult el.',
            {
              fontSize: '18px',
              color: '#ffffff'
            }
          );


          /*
           * -------------------------
           * STATISZTIKA
           * -------------------------
           */

          const statsText = this.add.text(
            10,
            tileSize * 4 + 70,
            'Lépések: 0 | Hibák: 0 | Idő: 0 mp',
            {
              fontSize: '16px',
              color: '#ffffff'
            }
          );


          /*
           * -------------------------
           * EREDMÉNY
           * -------------------------
           */

          const resultText = this.add.text(
            10,
            tileSize * 4 + 105,
            '',
            {
              fontSize: '16px',
              color: '#00ff99'
            }
          );


          /*
           * -------------------------
           * MEZŐK TÁROLÁSA
           * -------------------------
           */

          const tileObjects:
            Phaser.GameObjects.Rectangle[][] = [];


          /*
           * -------------------------
           * IDEIGLENES JÁTÉKOSJELÖLŐ
           * -------------------------
           *
           * Fejlesztés közben mutatja,
           * hogy a rendszer szerint
           * melyik mezőn áll a gyerek.
           */

          const player = this.add.container(
            tileSize / 2,
            tileSize / 2
          );

          player.setDepth(10);


          const playerBody = this.add.circle(
            0,
            10,
            24,
            0x0066ff
          );


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
              `Lépések: ${steps} | Hibák: ${mistakes} | Idő: ${elapsedSeconds} mp`
            );

          };


          /*
           * -------------------------
           * IDŐZÍTŐ
           * -------------------------
           *
           * Már létezik, de csak akkor
           * számol, ha gameStarted = true.
           */

          const timerEvent = this.time.addEvent({

            delay: 1000,

            loop: true,

            callback: () => {

              if (!gameStarted || gameFinished) {
                return;
              }

              const currentTime = Date.now();

              elapsedSeconds =
                Math.floor(
                  (currentTime - startTime) / 1000
                );

              updateStats();

            }

          });


          /*
           * -------------------------
           * JÁTÉK INDÍTÁSA
           * -------------------------
           *
           * MOST:
           * az INDÍTÁS gomb hívja meg.
           *
           * KÉSŐBB:
           * az ESP32 / START FSR
           * fogja meghívni.
           */

          const startGame = () => {

            if (gameStarted || gameFinished) {
              return;
            }

            gameStarted = true;

            startTime = Date.now();

            elapsedSeconds = 0;

            statusText.setText(
              '🚀 A játék elindult!'
            );

            updateStats();

          };


          /*
           * -------------------------
           * JÁTÉK BEFEJEZÉSE
           * -------------------------
           */

          const finishGame = () => {

            if (!gameStarted || gameFinished) {
              return;
            }

            gameFinished = true;


            const endTime = Date.now();

            elapsedSeconds =
              Math.floor(
                (endTime - startTime) / 1000
              );


            timerEvent.remove(false);

            updateStats();


            /*
             * Ezt az objektumot később
             * elküldjük a Laravel API-nak.
             */

            const result = {

              levelId: level.id,

              levelName: level.name,

              difficulty: level.difficulty,

              steps: steps,

              mistakes: mistakes,

              timeSeconds: elapsedSeconds,

              completed: true

            };


            console.log(
              'Játék eredménye:',
              result
            );


            statusText.setText(
              '🎉 Célba értél!'
            );


            resultText.setText(
              `Eredmény: ${elapsedSeconds} mp | ${steps} lépés | ${mistakes} hiba`
            );


            playerBody.setFillStyle(
              0x00ff00
            );

          };


          /*
           * -------------------------
           * MOZGÁS FELDOLGOZÁSA
           * -------------------------
           */

          const tryMove = (
            rowIndex: number,
            columnIndex: number
          ) => {

            /*
             * Indítás előtt nem lehet
             * mozogni.
             */

            if (!gameStarted) {

              statusText.setText(
                '⏳ Előbb indítsd el a játékot!'
              );

              return;

            }


            /*
             * Befejezett játék után
             * sem lehet tovább mozogni.
             */

            if (gameFinished) {
              return;
            }


            const tile =
              maze[rowIndex][columnIndex];


            /*
             * -------------------------
             * SZOMSZÉDOSSÁG
             * -------------------------
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
             * NEM SZOMSZÉDOS
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


              obstacle.setFillStyle(
                0xff3333
              );


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
             * A játékosjelölő azonnal
             * az új mezőre kerül.
             */

            player.setPosition(

              playerColumn * tileSize +
                tileSize / 2,

              playerRow * tileSize +
                tileSize / 2

            );


            /*
             * Bejárt mező kékre vált.
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
             * CÉL
             * -------------------------
             */

            if (tile === 'C') {

              finishGame();

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
                   * MEZŐ
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


                  tileObjects[rowIndex][columnIndex] =
                    rectangle;


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
           * INDÍTÁS GOMB
           * -------------------------
           */

          const startButton =
            this.add.text(
              160,
              tileSize * 4 + 105,
              '▶ INDÍTÁS',
              {

                fontSize: '16px',

                color: '#ffffff',

                backgroundColor:
                  '#16a34a',

                padding: {

                  x: 12,

                  y: 6

                }

              }
            )
            .setInteractive({
              useHandCursor: true
            });


          startButton.on(
            'pointerdown',
            () => {

              startGame();

              startButton.setVisible(false);

            }
          );


          /*
           * -------------------------
           * ÚJRAKEZDÉS GOMB
           * -------------------------
           */

          const restartButton =
            this.add.text(
              350,
              tileSize * 4 + 105,
              '🔄 Újra',
              {

                fontSize: '16px',

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