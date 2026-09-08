import { Component } from '@angular/core';

import { Game } from './game/game';

import { Level } from './levels/level.model';
import { LEVELS } from './levels/levels';

import { Child } from './children/child.model';
import { CHILDREN } from './children/children';

import { GameResult } from './results/game-result.model';
import { CompletedGameResult } from './results/completed-game-result.model';

import { ApiService } from './services/api.service';


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

  children = CHILDREN;

  levels = LEVELS;


  selectedChild: Child | null = null;

  selectedLevel: Level | null = null;

  lastResult: CompletedGameResult | null = null;


  apiMessage = '';

  apiError = '';


  constructor(
    private apiService: ApiService
  ) {

    this.testBackendConnection();

  }


  testBackendConnection(): void {

    this.apiService
      .testConnection()
      .subscribe({

        next: (response) => {

          this.apiMessage =
            response.message;

          this.apiError = '';

          console.log(
            'Laravel API válasza:',
            response
          );

        },

        error: (error) => {

          this.apiMessage = '';

          this.apiError =
            'Nem sikerült kapcsolódni a Laravel API-hoz.';

          console.error(
            'API hiba:',
            error
          );

        }

      });

  }


  selectChild(child: Child): void {

    this.selectedChild = child;

    this.selectedLevel = null;

    this.lastResult = null;

  }


  startLevel(level: Level): void {

    this.selectedLevel = level;

    this.lastResult = null;

  }


  backToChildren(): void {

    this.selectedChild = null;

    this.selectedLevel = null;

    this.lastResult = null;

  }


  backToLevels(): void {

    this.selectedLevel = null;

    this.lastResult = null;

  }


  handleGameFinished(
    gameResult: GameResult
  ): void {

    if (!this.selectedChild) {

      console.error(
        'Nincs kiválasztott játékos.'
      );

      return;

    }


    const completedResult:
      CompletedGameResult = {

        childId:
          this.selectedChild.id,

        childName:
          this.selectedChild.name,

        ...gameResult

      };


    this.lastResult =
      completedResult;


    console.log(
      'Teljes játék eredménye:',
      completedResult
    );

  }

}