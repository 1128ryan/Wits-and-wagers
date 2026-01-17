import React from 'react';
import { useGameStore } from '../store/gameStore';
import { findClosestGuess, getUniqueGuessValues } from '../utils/gameUtils';
import './ResultsPhase.css';

export const ResultsPhase: React.FC = () => {
  const { players, guesses, bets, roundNumber, totalRounds, getCurrentQuestion, nextRound } = useGameStore();

  const question = getCurrentQuestion();
  if (!question) return null;

  const sortedGuesses = getUniqueGuessValues(guesses);
  const winningGuess = findClosestGuess(guesses, question.answer);

  const getPlayerTotalBet = (playerId: string) => {
    return bets.filter(b => b.playerId === playerId).reduce((sum, b) => sum + b.amount, 0);
  };

  const getPlayerWinnings = (playerId: string) => {
    const playerBets = bets.filter(b => b.playerId === playerId && b.guessValue === winningGuess);
    if (playerBets.length === 0) return 0;

    const winningIndex = sortedGuesses.indexOf(winningGuess!);
    const odds = [2, 3, 4, 5, 6][Math.min(winningIndex, 4)];

    return playerBets.reduce((sum, b) => sum + b.amount * odds, 0);
  };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="results-phase">
      <div className="results-header">
        <h2>Results - Round {roundNumber}</h2>
      </div>

      <div className="answer-reveal">
        <div className="question-text">{question.question}</div>
        <div className="answer-box">
          <span className="answer-label">The Answer Is:</span>
          <span className="answer-value">{question.answer.toLocaleString()}</span>
        </div>
      </div>

      <div className="guesses-results">
        <h3>All Guesses</h3>
        <div className="guesses-visualization">
          {sortedGuesses.map((guess) => {
            const isWinner = guess === winningGuess;
            const playersWhoGuessed = guesses.filter(g => g.value === guess);
            const isOver = guess > question.answer;

            return (
              <div
                key={guess}
                className={`guess-result ${isWinner ? 'winner' : ''} ${isOver ? 'over' : ''}`}
              >
                <span className="result-value">{guess.toLocaleString()}</span>
                {isWinner && <span className="winner-badge">CLOSEST!</span>}
                {isOver && <span className="over-badge">OVER</span>}
                <div className="result-guessers">
                  {playersWhoGuessed.map(g => {
                    const player = players.find(p => p.id === g.playerId);
                    return player ? (
                      <span
                        key={g.playerId}
                        className="guesser-name"
                        style={{ backgroundColor: player.color }}
                      >
                        {player.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="answer-marker">
          <span>Correct Answer: {question.answer.toLocaleString()}</span>
        </div>
      </div>

      <div className="round-results">
        <h3>Round Results</h3>
        <table className="results-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Bet</th>
              <th>Won</th>
              <th>Total Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const totalBet = getPlayerTotalBet(player.id);
              const winnings = getPlayerWinnings(player.id);

              return (
                <tr key={player.id} className={index === 0 ? 'leading' : ''}>
                  <td>
                    <span className="player-dot" style={{ backgroundColor: player.color }} />
                    {player.name}
                  </td>
                  <td>{totalBet}</td>
                  <td className={winnings > 0 ? 'positive' : winnings < 0 ? 'negative' : ''}>
                    {winnings > 0 ? '+' : ''}{winnings}
                  </td>
                  <td className="score">{player.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="results-actions">
        <button className="next-round-btn" onClick={nextRound}>
          {roundNumber >= totalRounds ? 'See Final Results' : `Next Round (${roundNumber + 1}/${totalRounds})`}
        </button>
      </div>
    </div>
  );
};
