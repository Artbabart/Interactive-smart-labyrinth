import { Component } from '@angular/core';

import { Game } from './game/game';
import { Level } from './levels/level.model';
import { LEVELS } from './levels/levels';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    Game
  ],

  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  levels = LEVELS;

  selectedLevel: Level | null = null;


  startLevel(level: Level): void {

    this.selectedLevel = level;

  }


  backToMenu(): void {

    this.selectedLevel = null;

  }

}