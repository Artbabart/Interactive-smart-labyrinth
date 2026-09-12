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

    // =========================
    // ALAP MÉRETEK
    // =========================

    const tileSize = 120;

    const boardTop = 100;

    const boardSize =
      tileSize * 4;

    const gameWidth =
      boardSize;

    const gameHeight =
      boardTop +
      boardSize +
      180;


    const level =
      this.level;

    const maze =
      level.maze;

    const component =
      this;


    // =========================
    // PHASER CONFIG
    // =========================

    const config:
      Phaser.Types.Core.GameConfig = {

      type: Phaser.AUTO,

      width: gameWidth,

      height: gameHeight,

      parent:
        this.gameContainer.nativeElement,

      backgroundColor:
        '#dff4e6',

      scene: {

        // A letöltött assetet már
        // betöltjük.
        // Következő körben a valódi
        // dekorációkhoz használjuk.

        preload: function () {

          this.load.spritesheet(
            'nature-paths',
            'assets/nature/nature-paths.png',
            {
              frameWidth: 256,
              frameHeight: 256,
              spacing: 8
            }
          );

        },


        create: function () {

          // =========================
          // JÁTÉK ÁLLAPOTA
          // =========================

          let playerRow = 0;

          let playerColumn = 0;

          let steps = 0;

          let mistakes = 0;

          let gameStarted = false;

          let gameIsFinished = false;

          let startTime = 0;

          let elapsedSeconds = 0;


          // =========================
          // TELJES HÁTTÉR
          // =========================

          const background =
            this.add.graphics();

          background.fillGradientStyle(
            0xeaf8ef,
            0xeaf8ef,
            0xccebd7,
            0xccebd7,
            1
          );

          background.fillRect(
            0,
            0,
            gameWidth,
            gameHeight
          );


          // =========================
          // FEJLÉC
          // =========================

          this.add.text(
            gameWidth / 2,
            24,
            `🌿 ${level.name}`,
            {
              fontSize: '26px',
              color: '#24452e',
              fontStyle: 'bold'
            }
          )
          .setOrigin(
            0.5,
            0
          );


          this.add.text(
            gameWidth / 2,
            63,
            level.difficulty,
            {
              fontSize: '15px',
              color: '#ffffff',
              backgroundColor:
                '#4f8a5b',
              padding: {
                x: 12,
                y: 5
              }
            }
          )
          .setOrigin(0.5);


          // =========================
          // HUD
          // =========================

          const footerTop =
            boardTop +
            boardSize +
            15;


          const statusBackground =
            this.add.graphics();

          statusBackground.fillStyle(
            0xffffff,
            0.80
          );

          statusBackground.fillRoundedRect(
            15,
            footerTop,
            gameWidth - 30,
            48,
            14
          );


          const statusText =
            this.add.text(
              gameWidth / 2,
              footerTop + 24,
              '⏳ Nyomd meg az Indítás gombot!',
              {
                fontSize: '17px',
                color: '#35533d',
                fontStyle: 'bold',
                align: 'center'
              }
            )
            .setOrigin(0.5);


          const statsBackground =
            this.add.graphics();

          statsBackground.fillStyle(
            0xffffff,
            0.72
          );

          statsBackground.fillRoundedRect(
            15,
            footerTop + 58,
            gameWidth - 30,
            42,
            14
          );


          const statsText =
            this.add.text(
              gameWidth / 2,
              footerTop + 79,
              '👣 0    ❌ 0    ⏱️ 0 mp',
              {
                fontSize: '17px',
                color: '#294531',
                fontStyle: 'bold'
              }
            )
            .setOrigin(0.5);


          const resultText =
            this.add.text(
              gameWidth / 2,
              footerTop + 152,
              '',
              {
                fontSize: '15px',
                color: '#27613a',
                fontStyle: 'bold',
                align: 'center'
              }
            )
            .setOrigin(0.5);


          // =========================
          // PÁLYA OBJEKTUMOK
          // =========================

          const tileObjects:
            Phaser.GameObjects.Rectangle[][] =
            [];


          // =========================
          // JÁRHATÓ MEZŐ?
          // =========================

          const isWalkable = (
            row: number,
            column: number
          ): boolean => {

            if (
              row < 0 ||
              column < 0 ||
              row >= maze.length ||
              column >= maze[row].length
            ) {

              return false;

            }

            const tile =
              maze[row][column];

            return (
              tile === 'S' ||
              tile === 'P' ||
              tile === 'C'
            );

          };


          // =========================
          // MEZŐ KÖZÉPPONTJA
          // =========================

          const getTileCenter = (
            row: number,
            column: number
          ) => {

            return {

              x:
                column *
                tileSize +
                tileSize / 2,

              y:
                boardTop +
                row *
                tileSize +
                tileSize / 2

            };

          };


          // =========================
          // FÜVES ALAP
          // =========================

          const fieldGraphics =
            this.add.graphics();

          fieldGraphics
            .setDepth(0);

          fieldGraphics.fillStyle(
            0x86c96f,
            1
          );

          fieldGraphics.fillRect(
            0,
            boardTop,
            boardSize,
            boardSize
          );


          // =========================
          // FŰ TEXTÚRA
          // =========================

          const grassDecoration =
            this.add.graphics();

          grassDecoration
            .setDepth(1);


          for (
            let i = 0;
            i < 90;
            i++
          ) {

            const grassX =
              Phaser.Math.Between(
                8,
                boardSize - 8
              );

            const grassY =
              Phaser.Math.Between(
                boardTop + 8,
                boardTop +
                boardSize -
                8
              );

            const grassLength =
              Phaser.Math.Between(
                3,
                7
              );

            grassDecoration.lineStyle(
              2,
              Phaser.Math.RND.pick([
                0x72b65d,
                0x78bb63,
                0x95d27c
              ]),
              0.55
            );

            grassDecoration
              .beginPath();

            grassDecoration
              .moveTo(
                grassX,
                grassY
              );

            grassDecoration
              .lineTo(
                grassX - 2,
                grassY -
                grassLength
              );

            grassDecoration
              .strokePath();

          }


          // =========================
          // ÖSVÉNY ÁRNYÉK
          // =========================

          const pathShadow =
            this.add.graphics();

          pathShadow
            .setDepth(2);

          pathShadow.lineStyle(
            80,
            0x49633e,
            0.18
          );


          maze.forEach(
            (
              row,
              rowIndex
            ) => {

              row.forEach(
                (
                  tile,
                  columnIndex
                ) => {

                  if (
                    !isWalkable(
                      rowIndex,
                      columnIndex
                    )
                  ) {
                    return;
                  }


                  const center =
                    getTileCenter(
                      rowIndex,
                      columnIndex
                    );


                  // JOBBRA

                  if (
                    isWalkable(
                      rowIndex,
                      columnIndex + 1
                    )
                  ) {

                    const next =
                      getTileCenter(
                        rowIndex,
                        columnIndex + 1
                      );

                    pathShadow
                      .beginPath();

                    pathShadow
                      .moveTo(
                        center.x + 4,
                        center.y + 5
                      );

                    pathShadow
                      .lineTo(
                        next.x + 4,
                        next.y + 5
                      );

                    pathShadow
                      .strokePath();

                  }


                  // LEFELÉ

                  if (
                    isWalkable(
                      rowIndex + 1,
                      columnIndex
                    )
                  ) {

                    const next =
                      getTileCenter(
                        rowIndex + 1,
                        columnIndex
                      );

                    pathShadow
                      .beginPath();

                    pathShadow
                      .moveTo(
                        center.x + 4,
                        center.y + 5
                      );

                    pathShadow
                      .lineTo(
                        next.x + 4,
                        next.y + 5
                      );

                    pathShadow
                      .strokePath();

                  }

                }
              );

            }
          );


          // =========================
          // FŐ ÖSVÉNY
          // =========================

          const pathGraphics =
            this.add.graphics();

          pathGraphics
            .setDepth(3);

          pathGraphics.lineStyle(
            70,
            0xd9bd7c,
            1
          );


          maze.forEach(
            (
              row,
              rowIndex
            ) => {

              row.forEach(
                (
                  tile,
                  columnIndex
                ) => {

                  if (
                    !isWalkable(
                      rowIndex,
                      columnIndex
                    )
                  ) {
                    return;
                  }


                  const center =
                    getTileCenter(
                      rowIndex,
                      columnIndex
                    );


                  pathGraphics.fillStyle(
                    0xd9bd7c,
                    1
                  );

                  pathGraphics.fillCircle(
                    center.x,
                    center.y,
                    35
                  );


                  // JOBBRA

                  if (
                    isWalkable(
                      rowIndex,
                      columnIndex + 1
                    )
                  ) {

                    const next =
                      getTileCenter(
                        rowIndex,
                        columnIndex + 1
                      );

                    pathGraphics
                      .beginPath();

                    pathGraphics
                      .moveTo(
                        center.x,
                        center.y
                      );

                    pathGraphics
                      .lineTo(
                        next.x,
                        next.y
                      );

                    pathGraphics
                      .strokePath();

                  }


                  // LEFELÉ

                  if (
                    isWalkable(
                      rowIndex + 1,
                      columnIndex
                    )
                  ) {

                    const next =
                      getTileCenter(
                        rowIndex + 1,
                        columnIndex
                      );

                    pathGraphics
                      .beginPath();

                    pathGraphics
                      .moveTo(
                        center.x,
                        center.y
                      );

                    pathGraphics
                      .lineTo(
                        next.x,
                        next.y
                      );

                    pathGraphics
                      .strokePath();

                  }

                }
              );

            }
          );


          // =========================
          // ÖSVÉNY TEXTÚRA
          // =========================

          const pathDetails =
            this.add.graphics();

          pathDetails
            .setDepth(4);


          maze.forEach(
            (
              row,
              rowIndex
            ) => {

              row.forEach(
                (
                  tile,
                  columnIndex
                ) => {

                  if (
                    !isWalkable(
                      rowIndex,
                      columnIndex
                    )
                  ) {
                    return;
                  }


                  const center =
                    getTileCenter(
                      rowIndex,
                      columnIndex
                    );


                  for (
                    let i = 0;
                    i < 4;
                    i++
                  ) {

                    const detailX =
                      center.x +
                      Phaser.Math.Between(
                        -22,
                        22
                      );

                    const detailY =
                      center.y +
                      Phaser.Math.Between(
                        -22,
                        22
                      );


                    pathDetails.fillStyle(
                      Phaser.Math.RND.pick([
                        0xc6a76b,
                        0xe4ca91,
                        0xbfa066
                      ]),
                      0.55
                    );


                    pathDetails.fillCircle(
                      detailX,
                      detailY,
                      Phaser.Math.Between(
                        2,
                        4
                      )
                    );

                  }

                }
              );

            }
          );


          // =========================
          // VIRÁG DEKORÁCIÓK
          // =========================

          const flowerPositions = [

            {
              x: 35,
              y: boardTop + 260
            },

            {
              x: 420,
              y: boardTop + 65
            },

            {
              x: 415,
              y: boardTop + 430
            },

            {
              x: 75,
              y: boardTop + 420
            },

            {
              x: 400,
              y: boardTop + 210
            }

          ];


          flowerPositions.forEach(
            position => {

              const flower =
                this.add.container(
                  position.x,
                  position.y
                );

              flower
                .setDepth(5);


              const stem =
                this.add.rectangle(
                  0,
                  7,
                  3,
                  13,
                  0x4b8e45
                );


              const petal1 =
                this.add.circle(
                  -4,
                  -2,
                  4,
                  0xffffff
                );

              const petal2 =
                this.add.circle(
                  4,
                  -2,
                  4,
                  0xffffff
                );

              const petal3 =
                this.add.circle(
                  0,
                  -6,
                  4,
                  0xffffff
                );

              const petal4 =
                this.add.circle(
                  0,
                  2,
                  4,
                  0xffffff
                );

              const middle =
                this.add.circle(
                  0,
                  -2,
                  3,
                  0xffd34e
                );


              flower.add([
                stem,
                petal1,
                petal2,
                petal3,
                petal4,
                middle
              ]);

            }
          );


          // =========================
          // SZIKLÁK
          // =========================

          const rockPositions = [

            {
              x: 330,
              y: boardTop + 65,
              size: 28
            },

            {
              x: 65,
              y: boardTop + 185,
              size: 32
            },

            {
              x: 175,
              y: boardTop + 310,
              size: 28
            },

            {
              x: 420,
              y: boardTop + 310,
              size: 34
            },

            {
              x: 165,
              y: boardTop + 425,
              size: 30
            }

          ];


          rockPositions.forEach(
            rock => {

              const shadow =
                this.add.ellipse(
                  rock.x + 3,
                  rock.y + 8,
                  rock.size * 1.4,
                  rock.size * 0.6,
                  0x000000,
                  0.14
                );

              shadow
                .setDepth(5);


              const stone =
                this.add.circle(
                  rock.x,
                  rock.y,
                  rock.size / 2,
                  0x7b857b
                );

              stone.setStrokeStyle(
                3,
                0x687168
              );

              stone
                .setDepth(6);


              const shine =
                this.add.circle(
                  rock.x - 6,
                  rock.y - 6,
                  rock.size / 6,
                  0xaeb6ae,
                  0.6
                );

              shine
                .setDepth(7);

            }
          );


          // =========================
          // INTERAKTÍV MEZŐK
          // =========================

          maze.forEach(
            (
              row,
              rowIndex
            ) => {

              tileObjects[
                rowIndex
              ] = [];


              row.forEach(
                (
                  tile,
                  columnIndex
                ) => {

                  const center =
                    getTileCenter(
                      rowIndex,
                      columnIndex
                    );


                  // A rács fizikailag
                  // megmarad,
                  // de láthatatlan.

                  const interactionArea =
                    this.add.rectangle(
                      center.x,
                      center.y,
                      tileSize,
                      tileSize,
                      0xffffff,
                      0
                    );


                  interactionArea
                    .setDepth(15)
                    .setInteractive({
                      useHandCursor: true
                    });


                  tileObjects[
                    rowIndex
                  ][
                    columnIndex
                  ] =
                    interactionArea;


                  interactionArea.on(
                    'pointerdown',
                    () => {

                      tryMove(
                        rowIndex,
                        columnIndex
                      );

                    }
                  );


                  // =========================
                  // START
                  // =========================

                  if (tile === 'S') {

                    const startCircle =
                      this.add.circle(
                        center.x,
                        center.y,
                        34,
                        0x78c77e,
                        0.95
                      );

                    startCircle
                      .setDepth(8);

                    startCircle
                      .setStrokeStyle(
                        4,
                        0xffffff,
                        0.8
                      );


                    this.add.text(
                      center.x,
                      center.y - 5,
                      '🚩',
                      {
                        fontSize: '32px'
                      }
                    )
                    .setOrigin(0.5)
                    .setDepth(9);


                    this.add.text(
                      center.x,
                      center.y + 32,
                      'START',
                      {
                        fontSize: '12px',
                        color: '#294c30',
                        fontStyle: 'bold'
                      }
                    )
                    .setOrigin(0.5)
                    .setDepth(9);

                  }


                  // =========================
                  // CÉL
                  // =========================

                  if (tile === 'C') {

                    const goalGlow =
                      this.add.circle(
                        center.x,
                        center.y,
                        40,
                        0xffe680,
                        0.60
                      );

                    goalGlow
                      .setDepth(8);


                    this.tweens.add({

                      targets:
                        goalGlow,

                      scaleX: 1.18,

                      scaleY: 1.18,

                      alpha: 0.25,

                      duration: 850,

                      yoyo: true,

                      repeat: -1,

                      ease:
                        'Sine.easeInOut'

                    });


                    this.add.text(
                      center.x,
                      center.y,
                      '⭐',
                      {
                        fontSize: '42px'
                      }
                    )
                    .setOrigin(0.5)
                    .setDepth(9);

                  }

                }
              );

            }
          );


          // =========================
          // JÁTÉKOS
          // =========================

          const startCenter =
            getTileCenter(
              0,
              0
            );


          const player =
            this.add.container(
              startCenter.x,
              startCenter.y
            );


          player
            .setDepth(20);


          // árnyék

          const playerShadow =
            this.add.ellipse(
              0,
              31,
              50,
              18,
              0x000000,
              0.16
            );


          // test

          const playerBody =
            this.add.circle(
              0,
              12,
              24,
              0x5b8def
            );


          // fej

          const playerHead =
            this.add.circle(
              0,
              -16,
              17,
              0xffd6a5
            );


          // haj

          const playerHair =
            this.add.arc(
              0,
              -22,
              17,
              180,
              360,
              false,
              0x744624
            );


          // szemek

          const leftEye =
            this.add.circle(
              -6,
              -16,
              2,
              0x333333
            );


          const rightEye =
            this.add.circle(
              6,
              -16,
              2,
              0x333333
            );


          // hátizsák

          const backpack =
            this.add.rectangle(
              -20,
              13,
              12,
              25,
              0xe48b4a
            );


          player.add([
            playerShadow,
            backpack,
            playerBody,
            playerHead,
            playerHair,
            leftEye,
            rightEye
          ]);


          this.tweens.add({

            targets: player,

            scaleX: 1.04,

            scaleY: 1.04,

            duration: 700,

            yoyo: true,

            repeat: -1,

            ease:
              'Sine.easeInOut'

          });


          // =========================
          // STATISZTIKA FRISSÍTÉS
          // =========================

          const updateStats =
            () => {

              statsText.setText(
                `👣 ${steps}    ❌ ${mistakes}    ⏱️ ${elapsedSeconds} mp`
              );

            };


          // =========================
          // IDŐMÉRÉS
          // =========================

          const timerEvent =
            this.time.addEvent({

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
                    (
                      currentTime -
                      startTime
                    ) / 1000
                  );


                updateStats();

              }

            });


          // =========================
          // JÁTÉK INDÍTÁSA
          // =========================

          const startGame =
            () => {

              if (
                gameStarted ||
                gameIsFinished
              ) {

                return;

              }


              gameStarted = true;

              startTime =
                Date.now();

              elapsedSeconds = 0;


              statusText.setText(
                '🚀 Indulhat a kaland!'
              );


              updateStats();

            };


          // =========================
          // JÁTÉK BEFEJEZÉSE
          // =========================

          const finishGame =
            () => {

              if (
                !gameStarted ||
                gameIsFinished
              ) {

                return;

              }


              gameIsFinished =
                true;


              const endTime =
                Date.now();


              elapsedSeconds =
                Math.floor(
                  (
                    endTime -
                    startTime
                  ) / 1000
                );


              timerEvent.remove(
                false
              );


              updateStats();


              const result:
                GameResult = {

                levelId:
                  level.id,

                levelName:
                  level.name,

                difficulty:
                  level.difficulty,

                steps:
                  steps,

                mistakes:
                  mistakes,

                timeSeconds:
                  elapsedSeconds,

                completed:
                  true

              };


              console.log(
                'Játék eredménye:',
                result
              );


              component
                .gameFinished
                .emit(
                  result
                );


              statusText.setText(
                '🎉 Szuper! Megtaláltad a célt!'
              );


              resultText.setText(
                `⭐ ${elapsedSeconds} mp • ${steps} lépés • ${mistakes} hiba`
              );


              playerBody.setFillStyle(
                0x5dbb63
              );


              // győzelmi ugrálás

              this.tweens.add({

                targets: player,

                scaleX: 1.3,

                scaleY: 1.3,

                duration: 250,

                yoyo: true,

                repeat: 3

              });


              // csillag effekt

              for (
                let i = 0;
                i < 8;
                i++
              ) {

                const star =
                  this.add.text(
                    player.x,
                    player.y,
                    '⭐',
                    {
                      fontSize:
                        '22px'
                    }
                  )
                  .setOrigin(0.5)
                  .setDepth(30);


                const angle =
                  Math.random() *
                  Math.PI *
                  2;


                const distance =
                  50 +
                  Math.random() *
                  55;


                this.tweens.add({

                  targets:
                    star,

                  x:
                    player.x +
                    Math.cos(
                      angle
                    ) *
                    distance,

                  y:
                    player.y +
                    Math.sin(
                      angle
                    ) *
                    distance,

                  alpha: 0,

                  scale: 1.5,

                  duration:
                    700 +
                    Math.random() *
                    400,

                  onComplete:
                    () => {

                      star.destroy();

                    }

                });

              }

            };


          // =========================
          // MOZGÁS
          // =========================

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
              maze[
                rowIndex
              ][
                columnIndex
              ];


            const rowDistance =
              Math.abs(
                rowIndex -
                playerRow
              );


            const columnDistance =
              Math.abs(
                columnIndex -
                playerColumn
              );


            const isNeighbour =
              rowDistance +
              columnDistance === 1;


            // =========================
            // NEM SZOMSZÉDOS
            // =========================

            if (!isNeighbour) {

              mistakes++;


              statusText.setText(
                '🙂 Próbáld a melletted lévő mezőt!'
              );


              updateStats();

              return;

            }


            // =========================
            // AKADÁLY
            // =========================

            if (tile === 'X') {

              mistakes++;


              statusText.setText(
                '🪨 Arra nincs ösvény! Keress másik utat!'
              );


              updateStats();

              return;

            }


            // =========================
            // HELYES LÉPÉS
            // =========================

            playerRow =
              rowIndex;

            playerColumn =
              columnIndex;


            steps++;


            updateStats();


            const target =
              getTileCenter(
                playerRow,
                playerColumn
              );


            this.tweens.add({

              targets:
                player,

              x:
                target.x,

              y:
                target.y,

              duration:
                230,

              ease:
                'Sine.easeInOut'

            });


            statusText.setText(
              '✨ Ügyes! Jó irány!'
            );


            // =========================
            // CÉL
            // =========================

            if (tile === 'C') {

              this.time.delayedCall(
                250,
                () => {

                  finishGame();

                }
              );

            }

          };


          // =========================
          // BILLENTYŰZETES
          // SZENZOR SZIMULÁCIÓ
          // =========================

          const keyMap:
            Record<
              string,
              [number, number]
            > = {

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


          Object.entries(
            keyMap
          )
          .forEach(
            (
              [
                keyName,
                position
              ]
            ) => {

              const key =
                this.input
                  .keyboard
                  ?.addKey(
                    keyName
                  );


              key?.on(
                'down',
                () => {

                  const [
                    row,
                    column
                  ] =
                    position;


                  tryMove(
                    row,
                    column
                  );

                }
              );

            }
          );


          // =========================
          // GOMB SEGÉDFÜGGVÉNY
          // =========================

          const createButton = (
            x: number,
            y: number,
            width: number,
            text: string,
            color: number
          ) => {

            const container =
              this.add.container(
                x,
                y
              );


            const buttonBackground =
              this.add.rectangle(
                0,
                0,
                width,
                42,
                color
              );


            buttonBackground
              .setStrokeStyle(
                2,
                0xffffff,
                0.75
              );


            const buttonText =
              this.add.text(
                0,
                0,
                text,
                {
                  fontSize:
                    '16px',

                  color:
                    '#ffffff',

                  fontStyle:
                    'bold'
                }
              )
              .setOrigin(0.5);


            container.add([
              buttonBackground,
              buttonText
            ]);


            container.setSize(
              width,
              42
            );


            container
              .setInteractive({
                useHandCursor:
                  true
              });


            container.on(
              'pointerover',
              () => {

                container.setScale(
                  1.04
                );

              }
            );


            container.on(
              'pointerout',
              () => {

                container.setScale(
                  1
                );

              }
            );


            return container;

          };


          // =========================
          // INDÍTÁS GOMB
          // =========================

          const buttonY =
            footerTop +
            125;


          const startButton =
            createButton(
              145,
              buttonY,
              190,
              '▶ INDÍTÁS',
              0x4c9b62
            );


          startButton.on(
            'pointerdown',
            () => {

              startGame();

              startButton
                .setVisible(
                  false
                );

            }
          );


          // =========================
          // ÚJRAINDÍTÁS GOMB
          // =========================

          const restartButton =
            createButton(
              355,
              buttonY,
              170,
              '↻ ÚJRA',
              0x58717f
            );


          restartButton.on(
            'pointerdown',
            () => {

              component
                .gameFinished
                .emit(
                  undefined as any
                );


              this.scene.restart();

            }
          );

        }

      }

    };


    this.game =
      new Phaser.Game(
        config
      );

  }


  ngOnDestroy(): void {

    this.game?.destroy(
      true
    );

  }

}