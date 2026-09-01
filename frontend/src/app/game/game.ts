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
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: this.gameContainer.nativeElement,
      backgroundColor: '#d9f2d9',
      scene: {
        create: function () {
          this.add.text(250, 270, 'Smart Labirintus', {
            fontSize: '32px',
            color: '#000000'
          });
        }
      }
    };

    this.game = new Phaser.Game(config);
  }

  ngOnDestroy(): void {
    this.game?.destroy(true);
  }
}