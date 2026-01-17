export interface Question {
  id: number;
  question: string;
  answer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  unit?: string;
  source?: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface Guess {
  playerId: string;
  value: number;
}

export interface Bet {
  playerId: string;
  guessValue: number;
  amount: number;
}

export type GamePhase =
  | 'lobby'
  | 'question'
  | 'guessing'
  | 'betting'
  | 'results'
  | 'final';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentQuestionIndex: number;
  questions: Question[];
  guesses: Guess[];
  bets: Bet[];
  roundNumber: number;
  totalRounds: number;
  usedQuestionIds: Set<number>;
}

export const PLAYER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
];

export const BETTING_ODDS: Record<number, number> = {
  0: 2, // Closest guess pays 2:1
  1: 3, // Second closest pays 3:1
  2: 4, // Third closest pays 4:1
  3: 5, // Fourth closest pays 5:1
  4: 6, // Fifth closest pays 6:1
};
