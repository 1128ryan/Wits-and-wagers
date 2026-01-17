import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './QuestionPhase.css';

export const QuestionPhase: React.FC = () => {
  const { players, guesses, roundNumber, totalRounds, getCurrentQuestion, submitGuess } = useGameStore();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [showingInput, setShowingInput] = useState(true);

  const question = getCurrentQuestion();
  const currentPlayer = players[currentPlayerIndex];
  const hasGuessed = (playerId: string) => guesses.some(g => g.playerId === playerId);
  const allGuessed = guesses.length === players.length;

  const handleSubmitGuess = () => {
    const value = parseFloat(guessInput);
    if (!isNaN(value) && currentPlayer) {
      submitGuess(currentPlayer.id, value);
      setGuessInput('');

      // Move to next player who hasn't guessed
      const nextIndex = players.findIndex((p, i) => i > currentPlayerIndex && !hasGuessed(p.id));
      if (nextIndex !== -1) {
        setCurrentPlayerIndex(nextIndex);
        setShowingInput(false);
        setTimeout(() => setShowingInput(true), 300);
      } else {
        // Check if there's anyone before current index who hasn't guessed
        const earlierIndex = players.findIndex((p) => !hasGuessed(p.id) && !guesses.some(g => g.playerId === p.id));
        if (earlierIndex !== -1 && earlierIndex !== currentPlayerIndex) {
          setCurrentPlayerIndex(earlierIndex);
          setShowingInput(false);
          setTimeout(() => setShowingInput(true), 300);
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitGuess();
    }
  };

  if (!question) return null;

  return (
    <div className="question-phase">
      <div className="round-info">
        <span className="round-badge">Round {roundNumber} of {totalRounds}</span>
        <span className="category-badge">{question.category}</span>
      </div>

      <div className="question-card">
        <h2 className="question-text">{question.question}</h2>
      </div>

      {!allGuessed ? (
        <div className={`guess-section ${showingInput ? 'visible' : 'hidden'}`}>
          <div className="current-player" style={{ borderColor: currentPlayer?.color }}>
            <span className="player-indicator" style={{ backgroundColor: currentPlayer?.color }} />
            <span>{currentPlayer?.name}'s turn to guess</span>
          </div>

          <div className="guess-input-container">
            <input
              type="number"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your guess..."
              autoFocus
            />
            <button onClick={handleSubmitGuess} disabled={!guessInput}>
              Submit Guess
            </button>
          </div>

          <p className="hint">Don't let others see your answer!</p>
        </div>
      ) : (
        <div className="all-guessed">
          <p>All players have guessed!</p>
          <p className="auto-advance">Moving to betting phase...</p>
        </div>
      )}

      <div className="guess-progress">
        <h3>Guesses Submitted</h3>
        <div className="player-status-grid">
          {players.map((player) => (
            <div
              key={player.id}
              className={`player-status ${hasGuessed(player.id) ? 'guessed' : ''}`}
              style={{ borderColor: player.color }}
            >
              <span className="status-indicator" style={{ backgroundColor: hasGuessed(player.id) ? player.color : 'transparent' }}>
                {hasGuessed(player.id) ? '✓' : '?'}
              </span>
              <span className="status-name">{player.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
