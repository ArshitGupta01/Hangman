export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum GameStatus {
  Setup = 'Setup',
  Loading = 'Loading',
  Playing = 'Playing',
  Won = 'Won',
  Lost = 'Lost',
  BossIntro = 'BossIntro',
}

export interface HangmanData {
  word: string;
  hints: string[];
}
