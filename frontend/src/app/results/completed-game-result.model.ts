import { GameResult } from './game-result.model';

export interface CompletedGameResult extends GameResult {
  childId: number;
  childName: string;
}