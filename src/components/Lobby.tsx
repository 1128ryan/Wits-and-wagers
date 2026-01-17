import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './Lobby.css';

export const Lobby: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [rounds, setRounds] = useState(7);
  const { players, addPlayer, removePlayer, startGame } = useGameStore();

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      addPlayer(playerName.trim());
      setPlayerName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  const handleStartGame = () => {
    if (players.length >= 2) {
      startGame(rounds);
    }
  };

  return (
    <div className="lobby">
      <div className="lobby-header">
        <h1>Wits & Wagers</h1>
        <p className="tagline">The trivia game where everyone gets to play!</p>
      </div>

      <div className="lobby-content">
        <div className="add-player-section">
          <h2>Add Players</h2>
          <div className="add-player-form">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter player name"
              maxLength={20}
            />
            <button onClick={handleAddPlayer} disabled={!playerName.trim() || players.length >= 8}>
              Add Player
            </button>
          </div>
          <p className="player-count">{players.length}/8 players</p>
        </div>

        {players.length > 0 && (
          <div className="players-list">
            <h3>Players</h3>
            <div className="players-grid">
              {players.map((player) => (
                <div key={player.id} className="player-card" style={{ borderColor: player.color }}>
                  <span className="player-color" style={{ backgroundColor: player.color }} />
                  <span className="player-name">{player.name}</span>
                  <button
                    className="remove-player"
                    onClick={() => removePlayer(player.id)}
                    aria-label={`Remove ${player.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="game-settings">
          <h3>Game Settings</h3>
          <div className="rounds-selector">
            <label htmlFor="rounds">Number of Rounds:</label>
            <select
              id="rounds"
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
            >
              <option value={5}>5 Rounds (Quick)</option>
              <option value={7}>7 Rounds (Standard)</option>
              <option value={10}>10 Rounds (Long)</option>
              <option value={15}>15 Rounds (Marathon)</option>
            </select>
          </div>
        </div>

        <button
          className="start-game-btn"
          onClick={handleStartGame}
          disabled={players.length < 2}
        >
          {players.length < 2 ? `Need ${2 - players.length} more player(s)` : 'Start Game!'}
        </button>
      </div>

      <div className="lobby-footer">
        <h3>How to Play</h3>
        <ol>
          <li>Everyone guesses the answer to a numerical trivia question</li>
          <li>All guesses are revealed and arranged in order</li>
          <li>Place your bets on which guess is closest without going over</li>
          <li>Earn points based on correct bets and the odds!</li>
        </ol>
      </div>
    </div>
  );
};
