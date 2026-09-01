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
      height: tileSize * 4,

      parent: this.gameContainer.nativeElement,

      backgroundColor: '#222222',

      scene: {
        create: function () {

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
                color = 0x00aa00;
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

              if (tile === 'P') {
                color = 0xffffff;
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

                  console.log(
                    `Mező: ${rowIndex}-${columnIndex}`
                  );

                  if (tile === 'X') {

                    rectangle.setFillStyle(
                      0xff0000
                    );

                  } else {

                    rectangle.setFillStyle(
                      0x66ccff
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