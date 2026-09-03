export type TileType = 'S' | 'P' | 'X' | 'C';

export interface Level {
  id: number;
  name: string;
  difficulty: 'Könnyű' | 'Közepes' | 'Nehéz';

  maze: TileType[][];
}