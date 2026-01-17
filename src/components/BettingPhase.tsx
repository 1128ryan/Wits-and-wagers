import React, { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { getUniqueGuessValues } from '../utils/gameUtils';
import './BettingPhase.css';

const ODDS_LABELS = ['2:1', '3:1', '4:1', '5:1', '6:1'];

export const BettingPhase: React.FC = () => {
  const { players, guesses, bets, getCurrentQuestion, submitBet, revealResults } = useGameStore();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState(10);

  const question = getCurrentQuestion();
  const currentPlayer = players[currentPlayerIndex];

  const sortedGuesses = useMemo(() => {
    return getUniqueGuessValues(guesses);
  }, [guesses]);

  const getPlayerBets = (playerId: string) => {
    return bets.filter(b => b.playerId === playerId);
  };

  const getPlayerRemainingPoints = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return 0;
    const totalBet = getPlayerBets(playerId).reduce((sum, b) => sum + b.amount, 0);
    return player.score - totalBet;
  };

  const hasPlayerBet = (playerId: string) => {
    return bets.some(b => b.playerId === playerId);
  };

  const handlePlaceBet = () => {
    if (selectedGuess !== null && currentPlayer && betAmount > 0) {
      submitBet(currentPlayer.id, selectedGuess, betAmount);
      setSelectedGuess(null);
      setBetAmount(10);
    }
  };

  const handleFinishBetting = () => {
    // Move to next player
    const nextIndex = players.findIndex((p, i) => i > currentPlayerIndex && !hasPlayerBet(p.id));
    if (nextIndex !== -1) {
      setCurrentPlayerIndex(nextIndex);
    } else {
      // Check if all players have bet at least once
      const allHaveBet = players.every(p => hasPlayerBet(p.id));
      if (allHaveBet) {
        revealResults();
      } else {
        // Find first player who hasn't bet
        const firstUnbet = players.findIndex(p => !hasPlayerBet(p.id));
        if (firstUnbet !== -1) {
          setCurrentPlayerIndex(firstUnbet);
        }
      }
    }
  };

  const handleRevealResults = () => {
    revealResults();
  };

  if (!question) return null;

  const remainingPoints = currentPlayer ? getPlayerRemainingPoints(currentPlayer.id) : 0;
  const currentBets = currentPlayer ? getPlayerBets(currentPlayer.id) : [];
  const allHaveBet = players.every(p => hasPlayerBet(p.id));

  return (
    <div className="betting-phase">
      <div className="betting-header">
        <h2>Place Your Bets!</h2>
        <p className="question-reminder">{question.question}</p>
      </div>

      <div className="guesses-board">
        <h3>All Guesses (sorted low to high)</h3>
        <div className="guesses-row">
          {sortedGuesses.map((guess, index) => {
            const odds = ODDS_LABELS[Math.min(index, 4)];
            const playersWhoGuessed = guesses.filter(g => g.value === guess);

            return (
              <button
                key={guess}
                className={`guess-option ${selectedGuess === guess ? 'selected' : ''}`}
                onClick={() => setSelectedGuess(guess)}
                disabled={remainingPoints <= 0}
              >
                <span className="guess-value">{guess.toLocaleString()}</span>
                <span className="guess-odds">{odds}</span>
                <div className="guessers">
                  {playersWhoGuessed.map(g => {
                    const player = players.find(p => p.id === g.playerId);
                    return player ? (
                      <span
                        key={g.playerId}
                        className="guesser-dot"
                        style={{ backgroundColor: player.color }}
                        title={player.name}
                      />
                    ) : null;
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="betting-area">
        <div className="current-bettor" style={{ borderColor: currentPlayer?.color }}>
          <span className="bettor-indicator" style={{ backgroundColor: currentPlayer?.color }} />
          <span>{currentPlayer?.name}'s turn to bet</span>
          <span className="points-remaining">{remainingPoints} points remaining</span>
        </div>

        {currentBets.length > 0 && (
          <div className="current-bets">
            <h4>Your bets this round:</h4>
            <div className="bets-list">
              {currentBets.map((bet, i) => (
                <span key={i} className="bet-chip">
                  {bet.amount} on {bet.guessValue.toLocaleString()}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedGuess !== null && remainingPoints > 0 && (
          <div className="bet-controls">
            <label>Bet Amount:</label>
            <div className="bet-amount-selector">
              <button onClick={() => setBetAmount(Math.max(5, betAmount - 5))}>-5</button>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.min(remainingPoints, Math.max(1, parseInt(e.target.value) || 0)))}
                min={1}
                max={remainingPoints}
              />
              <button onClick={() => setBetAmount(Math.min(remainingPoints, betAmount + 5))}>+5</button>
              <button onClick={() => setBetAmount(remainingPoints)} className="all-in">All In</button>
            </div>
            <button className="place-bet-btn" onClick={handlePlaceBet}>
              Place Bet ({betAmount} points on {selectedGuess.toLocaleString()})
            </button>
          </div>
        )}

        <div className="betting-actions">
          {hasPlayerBet(currentPlayer?.id || '') && (
            <button className="done-betting-btn" onClick={handleFinishBetting}>
              Done Betting
            </button>
          )}
        </div>
      </div>

      {allHaveBet && (
        <div className="reveal-section">
          <button className="reveal-btn" onClick={handleRevealResults}>
            Reveal Answer!
          </button>
        </div>
      )}

      <div className="betting-status">
        <h4>Betting Progress</h4>
        <div className="player-betting-status">
          {players.map(player => (
            <div
              key={player.id}
              className={`status-item ${hasPlayerBet(player.id) ? 'has-bet' : ''} ${player.id === currentPlayer?.id ? 'current' : ''}`}
            >
              <span className="status-dot" style={{ backgroundColor: player.color }} />
              <span className="status-name">{player.name}</span>
              <span className="status-bet">
                {getPlayerBets(player.id).reduce((sum, b) => sum + b.amount, 0)} points bet
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
