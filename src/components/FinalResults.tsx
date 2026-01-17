import React from 'react';
import { useGameStore } from '../store/gameStore';
import './FinalResults.css';

export const FinalResults: React.FC = () => {
  const { players, resetGame } = useGameStore();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const getMedal = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  const getPlacement = (index: number) => {
    switch (index) {
      case 0: return '1st';
      case 1: return '2nd';
      case 2: return '3rd';
      default: return `${index + 1}th`;
    }
  };

  return (
    <div className="final-results">
      <div className="confetti-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)]
            }}
          />
        ))}
      </div>

      <div className="winner-announcement">
        <h1>Game Over!</h1>
        <div className="winner-card" style={{ borderColor: winner.color }}>
          <span className="winner-medal">🏆</span>
          <h2>{winner.name} Wins!</h2>
          <p className="winner-score">{winner.score} points</p>
        </div>
      </div>

      <div className="final-standings">
        <h2>Final Standings</h2>
        <div className="standings-list">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`standing-item ${index === 0 ? 'winner' : ''}`}
              style={{ borderLeftColor: player.color }}
            >
              <span className="placement">
                {getMedal(index)} {getPlacement(index)}
              </span>
              <span className="player-info">
                <span className="player-dot" style={{ backgroundColor: player.color }} />
                {player.name}
              </span>
              <span className="final-score">{player.score} pts</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <h3>Game Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{players.length}</span>
            <span className="stat-label">Players</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{sortedPlayers.reduce((sum, p) => sum + p.score, 0)}</span>
            <span className="stat-label">Total Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{winner.score - (sortedPlayers[1]?.score || 0)}</span>
            <span className="stat-label">Winning Margin</span>
          </div>
        </div>
      </div>

      <div className="final-actions">
        <button className="play-again-btn" onClick={resetGame}>
          Play Again
        </button>
      </div>
    </div>
  );
};
