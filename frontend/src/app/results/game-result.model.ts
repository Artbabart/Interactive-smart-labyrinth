export interface GameResult {
  levelId: number;
  levelName: string;
  difficulty: string;

  steps: number;
  mistakes: number;
  timeSeconds: number;

  completed: boolean;
}