import type { Guess, Bet, Player, Question } from '../types/game';
import { BETTING_ODDS } from '../types/game';

export function sortGuessesByValue(guesses: Guess[]): Guess[] {
  return [...guesses].sort((a, b) => a.value - b.value);
}

export function getUniqueGuessValues(guesses: Guess[]): number[] {
  const values = [...new Set(guesses.map(g => g.value))];
  return values.sort((a, b) => a - b);
}

export function findClosestGuess(guesses: Guess[], correctAnswer: number): number | null {
  const uniqueValues = getUniqueGuessValues(guesses);

  // Filter to only guesses that don't go over
  const validGuesses = uniqueValues.filter(v => v <= correctAnswer);

  if (validGuesses.length === 0) {
    // If all guesses are over, the lowest guess wins
    return uniqueValues.length > 0 ? uniqueValues[0] : null;
  }

  // Return the highest valid guess (closest without going over)
  return validGuesses[validGuesses.length - 1];
}

export function calculateBettingOdds(guessValue: number, sortedGuesses: number[], correctAnswer: number): number {
  // Find the distance rank of this guess from the correct answer
  const validGuesses = sortedGuesses.filter(v => v <= correctAnswer);

  if (validGuesses.length === 0) {
    // All guesses went over, lowest wins
    const index = sortedGuesses.indexOf(guessValue);
    return BETTING_ODDS[Math.min(index, 4)] || 6;
  }

  // Rank by how close (without going over)
  const rankedGuesses = [...validGuesses].sort((a, b) => b - a);
  const index = rankedGuesses.indexOf(guessValue);

  if (index === -1) {
    // This guess went over, it's at the back
    return 6;
  }

  return BETTING_ODDS[Math.min(index, 4)] || 6;
}

export function calculateRoundResults(
  guesses: Guess[],
  bets: Bet[],
  correctAnswer: number,
  players: Player[]
): { updatedPlayers: Player[]; winningGuess: number | null } {
  const winningGuess = findClosestGuess(guesses, correctAnswer);
  const updatedPlayers = players.map(player => ({ ...player }));

  if (winningGuess === null) {
    return { updatedPlayers, winningGuess };
  }

  // Calculate winnings for each bet
  bets.forEach(bet => {
    const playerIndex = updatedPlayers.findIndex(p => p.id === bet.playerId);
    if (playerIndex === -1) return;

    if (bet.guessValue === winningGuess) {
      // Winner! Calculate odds
      const sortedValues = getUniqueGuessValues(guesses);
      const odds = calculateBettingOdds(bet.guessValue, sortedValues, correctAnswer);
      updatedPlayers[playerIndex].score += bet.amount * odds;
    }
    // Lost bets don't affect score (they've already "spent" them by betting)
  });

  return { updatedPlayers, winningGuess };
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function getRandomQuestions(allQuestions: Question[], count: number, usedIds: Set<number>): Question[] {
  const availableQuestions = allQuestions.filter(q => !usedIds.has(q.id));
  const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 9);
}
