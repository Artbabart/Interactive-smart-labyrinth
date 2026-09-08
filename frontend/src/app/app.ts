import {
  Component,
  signal
} from '@angular/core';

import { Game } from './game/game';

import { Level } from './levels/level.model';
import { LEVELS } from './levels/levels';

import { Child } from './children/child.model';

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

  // =========================
  // PÁLYÁK
  // =========================

  levels = LEVELS;


  // =========================
  // GYEREKEK
  // =========================

  children =
    signal<Child[]>([]);

  childrenLoading =
    signal(false);

  childrenError =
    signal('');


  // =========================
  // ÚJ GYEREK
  // =========================

  childCreateLoading =
    signal(false);

  childCreateMessage =
    signal('');

  childCreateError =
    signal('');


  // =========================
  // KIVÁLASZTÁS
  // =========================

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

    this.loadChildren();

  }


  // =========================
  // BACKEND KAPCSOLAT
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
  // GYEREKEK BETÖLTÉSE
  // =========================

  loadChildren(): void {

    this.childrenLoading.set(true);

    this.childrenError.set('');


    this.apiService
      .getChildren()
      .subscribe({

        next: (response) => {

          this.children.set(
            response.children
          );

          this.childrenLoading.set(
            false
          );

          console.log(
            'Betöltött gyerekek:',
            response.children
          );

        },


        error: (error) => {

          this.children.set([]);

          this.childrenLoading.set(
            false
          );

          this.childrenError.set(
            'A gyerekek betöltése nem sikerült.'
          );

          console.error(
            'Gyerekek betöltési hiba:',
            error
          );

        }

      });

  }


  // =========================
  // ÚJ GYEREK HOZZÁADÁSA
  // =========================

  addChild(
    input: HTMLInputElement
  ): void {

    const name =
      input.value.trim();


    if (!name) {

      this.childCreateError.set(
        'Adj meg egy nevet.'
      );

      this.childCreateMessage.set('');

      return;

    }


    this.childCreateLoading.set(true);

    this.childCreateMessage.set('');

    this.childCreateError.set('');


    this.apiService
      .createChild(name)
      .subscribe({

        next: (response) => {

          this.childCreateLoading.set(
            false
          );

          this.childCreateMessage.set(
            response.message
          );

          this.childCreateError.set('');

          input.value = '';

          console.log(
            'Új gyerek létrehozva:',
            response.child
          );

          this.loadChildren();

        },


        error: (error) => {

          this.childCreateLoading.set(
            false
          );

          this.childCreateMessage.set('');

          this.childCreateError.set(
            'A gyerek hozzáadása nem sikerült.'
          );

          console.error(
            'Gyerek létrehozási hiba:',
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