import {
  Component,
  signal
} from '@angular/core';

import { Game } from './game/game';

import { Level } from './levels/level.model';
import { LEVELS } from './levels/levels';

import { Child } from './children/child.model';
import { CHILDREN } from './children/children';

import { GameResult } from './results/game-result.model';

import {
  CompletedGameResult
} from './results/completed-game-result.model';

import {
  ApiService,
  StoredGameResult
} from './services/api.service';


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


  // =========================
  // API ÁLLAPOT
  // =========================

  apiMessage = signal('');

  apiError = signal('');


  // =========================
  // MENTÉS ÁLLAPOT
  // =========================

  saveMessage = signal('');

  saveError = signal('');


  // =========================
  // EREDMÉNYLISTA
  // =========================

  results =
    signal<StoredGameResult[]>([]);

  showResults =
    signal(false);

  resultsLoading =
    signal(false);

  resultsError =
    signal('');


  constructor(
    private apiService: ApiService
  ) {

    this.testBackendConnection();

  }


  // =========================
  // BACKEND KAPCSOLAT TESZT
  // =========================

  testBackendConnection(): void {

    this.apiService
      .testConnection()
      .subscribe({

        next: (response) => {

          this.apiMessage.set(
            response.message
          );

          this.apiError.set('');

          console.log(
            'Laravel API válasza:',
            response
          );

        },


        error: (error) => {

          this.apiMessage.set('');

          this.apiError.set(
            'Nem sikerült kapcsolódni a Laravel API-hoz.'
          );

          console.error(
            'API hiba:',
            error
          );

        }

      });

  }


  // =========================
  // EREDMÉNYEK BETÖLTÉSE
  // =========================

  loadResults(): void {

    this.resultsLoading.set(true);

    this.resultsError.set('');


    this.apiService
      .getResults()
      .subscribe({

        next: (response) => {

          this.results.set(
            response.results
          );

          this.resultsLoading.set(
            false
          );

          console.log(
            'Betöltött eredmények:',
            response.results
          );

        },


        error: (error) => {

          this.results.set([]);

          this.resultsLoading.set(
            false
          );

          this.resultsError.set(
            'Az eredmények betöltése nem sikerült.'
          );

          console.error(
            'Eredmények betöltési hiba:',
            error
          );

        }

      });

  }


  // =========================
  // EREDMÉNYEK OLDAL
  // =========================

  openResults(): void {

    this.showResults.set(true);

    this.selectedChild = null;

    this.selectedLevel = null;

    this.lastResult = null;

    this.loadResults();

  }


  closeResults(): void {

    this.showResults.set(false);

  }


  // =========================
  // GYEREK KIVÁLASZTÁSA
  // =========================

  selectChild(child: Child): void {

    this.showResults.set(false);

    this.selectedChild = child;

    this.selectedLevel = null;

    this.lastResult = null;

    this.saveMessage.set('');

    this.saveError.set('');

  }


  // =========================
  // PÁLYA INDÍTÁSA
  // =========================

  startLevel(level: Level): void {

    this.selectedLevel = level;

    this.lastResult = null;

    this.saveMessage.set('');

    this.saveError.set('');

  }


  // =========================
  // VISSZA A GYEREKEKHEZ
  // =========================

  backToChildren(): void {

    this.selectedChild = null;

    this.selectedLevel = null;

    this.lastResult = null;

    this.saveMessage.set('');

    this.saveError.set('');

  }


  // =========================
  // VISSZA A PÁLYÁKHOZ
  // =========================

  backToLevels(): void {

    this.selectedLevel = null;

    this.lastResult = null;

    this.saveMessage.set('');

    this.saveError.set('');

  }


  // =========================
  // JÁTÉK BEFEJEZÉSE
  // =========================

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


    this.apiService
      .saveResult(completedResult)
      .subscribe({

        next: (response) => {

          this.saveMessage.set(
            response.message
          );

          this.saveError.set('');

          console.log(
            'Mentés sikeres:',
            response
          );

        },


        error: (error) => {

          this.saveMessage.set('');

          this.saveError.set(
            'Az eredmény mentése nem sikerült.'
          );

          console.error(
            'Mentési hiba:',
            error
          );

        }

      });

  }

}