import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

import Phaser from 'phaser';

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

    const tileSize = 120;

    const maze = [
      ['S', 'P', 'X', 'X'],
      ['X', 'P', 'P', 'X'],
      ['X', 'X', 'P', 'C'],
      ['P', 'P', 'P', 'X']
    ];

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,

      width: tileSize * 4,
      height: tileSize * 4 + 100,

      parent: this.gameContainer.nativeElement,

      backgroundColor: '#222222',

      scene: {
        create: function () {

          let playerRow = 0;
          let playerColumn = 0;

          let steps = 0;
          let mistakes = 0;

          let gameFinished = false;

          const statusText = this.add.text(
            10,
            tileSize * 4 + 10,
            'Indulás!',
            {
              fontSize: '20px',
              color: '#ffffff'
            }
          );

          const statsText = this.add.text(
            10,
            tileSize * 4 + 45,
            'Lépések: 0 | Hibák: 0',
            {
              fontSize: '18px',
              color: '#ffffff'
            }
          );

          const player = this.add.circle(
            tileSize / 2,
            tileSize / 2,
            25,
            0x0066ff
          );

          const updatePlayerPosition = () => {

            player.setPosition(
              playerColumn * tileSize + tileSize / 2,
              playerRow * tileSize + tileSize / 2
            );

          };

          const updateStats = () => {

            statsText.setText(
              `Lépések: ${steps} | Hibák: ${mistakes}`
            );

          };

          maze.forEach((row, rowIndex) => {

            row.forEach((tile, columnIndex) => {

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

              rectangle.setInteractive();

              rectangle.on(
                'pointerdown',
                () => {

                  if (gameFinished) {
                    return;
                  }

                  const rowDistance =
                    Math.abs(rowIndex - playerRow);

                  const columnDistance =
                    Math.abs(columnIndex - playerColumn);

                  const isNeighbour =
                    rowDistance + columnDistance === 1;

                  if (!isNeighbour) {

                    mistakes++;

                    statusText.setText(
                      '❌ Csak szomszédos mezőre léphetsz!'
                    );

                    updateStats();

                    return;
                  }

                  if (tile === 'X') {

                    mistakes++;

                    rectangle.setFillStyle(
                      0xff3333
                    );

                    statusText.setText(
                      '❌ Ez akadály!'
                    );

                    updateStats();

                    this.time.delayedCall(
                      400,
                      () => {
                        rectangle.setFillStyle(
                          0x555555
                        );
                      }
                    );

                    return;
                  }

                  playerRow = rowIndex;
                  playerColumn = columnIndex;

                  steps++;

                  updatePlayerPosition();
                  updateStats();

                  rectangle.setFillStyle(
                    0x66ccff
                  );

                  statusText.setText(
                    '✅ Ügyes! Jó lépés.'
                  );

                  if (tile === 'C') {

                    gameFinished = true;

                    statusText.setText(
                      `🎉 Célba értél! Lépések: ${steps}, hibák: ${mistakes}`
                    );

                    player.setFillStyle(
                      0x00ff00
                    );
                  }
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

            });

          });

          updatePlayerPosition();
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