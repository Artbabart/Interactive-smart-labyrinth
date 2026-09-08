import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

import Phaser from 'phaser';

import { Level } from '../levels/level.model';
import { LEVEL_1 } from '../levels/level-1';
import { GameResult } from '../results/game-result.model';


@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements AfterViewInit, OnDestroy {

  @Input()
  level: Level = LEVEL_1;

  @Output()
  gameFinished = new EventEmitter<GameResult>();

  @ViewChild('gameContainer', { static: true })
  gameContainer!: ElementRef<HTMLDivElement>;

  private game?: Phaser.Game;


  ngAfterViewInit(): void {

    const tileSize = 120;

    const level = this.level;

    const maze = level.maze;

    // Erre azért van szükség,
    // hogy a Phaserből elérjük
    // az Angular komponenst.
    const component = this;


    const config: Phaser.Types.Core.GameConfig = {

      type: Phaser.AUTO,

      width: tileSize * 4,

      height: tileSize * 4 + 160,

      parent: this.gameContainer.nativeElement,

      backgroundColor: '#222222',


      scene: {

        create: function () {

          let playerRow = 0;

          let playerColumn = 0;


          let steps = 0;

          let mistakes = 0;


          let gameStarted = false;

          let gameIsFinished = false;


          let startTime = 0;

          let elapsedSeconds = 0;


          // -------------------------
          // SZÖVEGEK
          // -------------------------

          this.add.text(
            10,
            tileSize * 4 + 5,
            `${level.name} – ${level.difficulty}`,
            {
              fontSize: '18px',
              color: '#ffcc00'
            }
          );


          const statusText = this.add.text(
            10,
            tileSize * 4 + 35,
            '⏳ A játék még nem indult el.',
            {
              fontSize: '18px',
              color: '#ffffff'
            }
          );


          const statsText = this.add.text(
            10,
            tileSize * 4 + 70,
            'Lépések: 0 | Hibák: 0 | Idő: 0 mp',
            {
              fontSize: '16px',
              color: '#ffffff'
            }
          );


          const resultText = this.add.text(
            10,
            tileSize * 4 + 135,
            '',
            {
              fontSize: '16px',
              color: '#00ff99'
            }
          );


          // -------------------------
          // PÁLYA OBJEKTUMOK
          // -------------------------

          const tileObjects:
            Phaser.GameObjects.Rectangle[][] = [];


          // -------------------------
          // JÁTÉKOS
          // -------------------------

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


          // -------------------------
          // STATISZTIKA FRISSÍTÉS
          // -------------------------

          const updateStats = () => {

            statsText.setText(
              `Lépések: ${steps} | Hibák: ${mistakes} | Idő: ${elapsedSeconds} mp`
            );

          };


          // -------------------------
          // IDŐMÉRÉS
          // -------------------------

          const timerEvent = this.time.addEvent({

            delay: 1000,

            loop: true,

            callback: () => {

              if (
                !gameStarted ||
                gameIsFinished
              ) {
                return;
              }


              const currentTime =
                Date.now();


              elapsedSeconds =
                Math.floor(
                  (currentTime - startTime) /
                  1000
                );


              updateStats();

            }

          });


          // -------------------------
          // JÁTÉK INDÍTÁSA
          // -------------------------

          const startGame = () => {

            if (
              gameStarted ||
              gameIsFinished
            ) {
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


          // -------------------------
          // JÁTÉK BEFEJEZÉSE
          // -------------------------

          const finishGame = () => {

            if (
              !gameStarted ||
              gameIsFinished
            ) {
              return;
            }


            gameIsFinished = true;


            const endTime =
              Date.now();


            elapsedSeconds =
              Math.floor(
                (endTime - startTime) /
                1000
              );


            timerEvent.remove(false);


            updateStats();


            const result: GameResult = {

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


            // EREDMÉNY ÁTADÁSA
            // A SZÜLŐ ANGULAR KOMPONENSNEK

            component.gameFinished.emit(
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


          // -------------------------
          // MOZGÁS
          // -------------------------

          const tryMove = (
            rowIndex: number,
            columnIndex: number
          ) => {

            if (!gameStarted) {

              statusText.setText(
                '⏳ Előbb indítsd el a játékot!'
              );

              return;

            }


            if (gameIsFinished) {

              return;

            }


            const tile =
              maze[rowIndex][columnIndex];


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


            // NEM SZOMSZÉDOS MEZŐ

            if (!isNeighbour) {

              mistakes++;


              statusText.setText(
                '❌ Csak szomszédos mezőre léphetsz!'
              );


              updateStats();


              return;

            }


            // AKADÁLY

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


            // HELYES LÉPÉS

            playerRow = rowIndex;

            playerColumn = columnIndex;


            steps++;


            updateStats();


            player.setPosition(
              playerColumn * tileSize +
                tileSize / 2,

              playerRow * tileSize +
                tileSize / 2
            );


            tileObjects[rowIndex][columnIndex]
              .setFillStyle(
                0x66ccff
              );


            statusText.setText(
              '✅ Ügyes! Jó lépés.'
            );


            // CÉL

            if (tile === 'C') {

              finishGame();

            }

          };


          // -------------------------
          // PÁLYA KIRAJZOLÁSA
          // -------------------------

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


                  if (tile === 'S') {

                    color = 0x66cc66;

                    label = 'START';

                  }


                  if (tile === 'C') {

                    color = 0xffcc00;

                    label = 'CÉL';

                  }


                  if (tile === 'X') {

                    color = 0x555555;

                    label = 'X';

                  }


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


                  rectangle.on(
                    'pointerdown',
                    () => {

                      tryMove(
                        rowIndex,
                        columnIndex
                      );

                    }
                  );


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


          // -------------------------
          // BILLENTYŰZETES TESZTELÉS
          // -------------------------

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


          // -------------------------
          // INDÍTÁS GOMB
          // -------------------------

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

              startButton.setVisible(
                false
              );

            }
          );


          // -------------------------
          // ÚJRAINDÍTÁS GOMB
          // -------------------------

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

              component.gameFinished.emit(
                undefined as any
              );

              this.scene.restart();

            }
          );

        }

      }

    };


    this.game =
      new Phaser.Game(config);

  }


  ngOnDestroy(): void {

    this.game?.destroy(true);

  }

}