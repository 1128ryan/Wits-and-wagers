import { create } from 'zustand';
import type { GameState, Player, Guess, Bet, Question, GamePhase } from '../types/game';
import { PLAYER_COLORS } from '../types/game';
import { getRandomQuestions, generatePlayerId, calculateRoundResults } from '../utils/gameUtils';
import { questions as allQuestions } from '../data/questions';

interface GameStore extends GameState {
  // Actions
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  startGame: (rounds: number) => void;
  submitGuess: (playerId: string, value: number) => void;
  submitBet: (playerId: string, guessValue: number, amount: number) => void;
  revealResults: () => void;
  nextRound: () => void;
  resetGame: () => void;
  setPhase: (phase: GamePhase) => void;
  allGuessesSubmitted: () => boolean;
  allBetsSubmitted: () => boolean;
  getCurrentQuestion: () => Question | null;
  getPlayerById: (id: string) => Player | undefined;
}

const initialState: GameState = {
  phase: 'lobby',
  players: [],
  currentQuestionIndex: 0,
  questions: [],
  guesses: [],
  bets: [],
  roundNumber: 1,
  totalRounds: 7,
  usedQuestionIds: new Set(),
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  addPlayer: (name: string) => {
    const { players } = get();
    if (players.length >= 8) return;

    const newPlayer: Player = {
      id: generatePlayerId(),
      name,
      score: 0,
      color: PLAYER_COLORS[players.length % PLAYER_COLORS.length],
    };

    set({ players: [...players, newPlayer] });
  },

  removePlayer: (playerId: string) => {
    const { players } = get();
    const updatedPlayers = players.filter(p => p.id !== playerId);
    // Reassign colors
    const recoloredPlayers = updatedPlayers.map((p, i) => ({
      ...p,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    }));
    set({ players: recoloredPlayers });
  },

  startGame: (rounds: number) => {
    const { players, usedQuestionIds } = get();
    if (players.length < 2) return;

    const gameQuestions = getRandomQuestions(allQuestions, rounds, usedQuestionIds);
    const newUsedIds = new Set(usedQuestionIds);
    gameQuestions.forEach(q => newUsedIds.add(q.id));

    // Reset player scores
    const resetPlayers = players.map(p => ({ ...p, score: 100 }));

    set({
      phase: 'question',
      questions: gameQuestions,
      currentQuestionIndex: 0,
      roundNumber: 1,
      totalRounds: rounds,
      guesses: [],
      bets: [],
      players: resetPlayers,
      usedQuestionIds: newUsedIds,
    });
  },

  submitGuess: (playerId: string, value: number) => {
    const { guesses, players } = get();

    // Check if player already guessed
    if (guesses.some(g => g.playerId === playerId)) return;

    // Validate player exists
    if (!players.some(p => p.id === playerId)) return;

    const newGuess: Guess = { playerId, value };
    const updatedGuesses = [...guesses, newGuess];

    set({ guesses: updatedGuesses });

    // Auto-advance to betting if all players have guessed
    if (updatedGuesses.length === players.length) {
      setTimeout(() => set({ phase: 'betting' }), 500);
    }
  },

  submitBet: (playerId: string, guessValue: number, amount: number) => {
    const { bets, players } = get();

    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // Calculate total already bet by this player
    const totalBet = bets
      .filter(b => b.playerId === playerId)
      .reduce((sum, b) => sum + b.amount, 0);

    // Check if player has enough points
    if (totalBet + amount > player.score) return;

    const newBet: Bet = { playerId, guessValue, amount };
    set({ bets: [...bets, newBet] });
  },

  revealResults: () => {
    const { guesses, bets, players, questions, currentQuestionIndex } = get();
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) return;

    const { updatedPlayers } = calculateRoundResults(
      guesses,
      bets,
      currentQuestion.answer,
      players
    );

    set({ phase: 'results', players: updatedPlayers });
  },

  nextRound: () => {
    const { currentQuestionIndex, totalRounds, roundNumber } = get();

    if (roundNumber >= totalRounds) {
      set({ phase: 'final' });
      return;
    }

    set({
      phase: 'question',
      currentQuestionIndex: currentQuestionIndex + 1,
      roundNumber: roundNumber + 1,
      guesses: [],
      bets: [],
    });
  },

  resetGame: () => {
    set({
      ...initialState,
      players: get().players.map(p => ({ ...p, score: 0 })),
      usedQuestionIds: get().usedQuestionIds,
    });
  },

  setPhase: (phase: GamePhase) => set({ phase }),

  allGuessesSubmitted: () => {
    const { guesses, players } = get();
    return guesses.length === players.length;
  },

  allBetsSubmitted: () => {
    const { bets, players } = get();
    // Check if each player has at least one bet
    const playersBet = new Set(bets.map(b => b.playerId));
    return players.every(p => playersBet.has(p.id));
  },

  getCurrentQuestion: () => {
    const { questions, currentQuestionIndex } = get();
    return questions[currentQuestionIndex] || null;
  },

  getPlayerById: (id: string) => {
    const { players } = get();
    return players.find(p => p.id === id);
  },
}));
