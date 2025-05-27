// components/RoomInfo.tsx
import React from 'react';
import './RoomInfo.css';
import { Socket } from 'socket.io-client';

type RoomInfoProps = {
  roomId: string;
  players: string[];
  roomSize: number;
  boardSize: number;
  currentPlayer: 'Black' | 'White' | 'Green' | 'Purple' | 'Other';
  prisoners: number[];
  gameState: string;
  socketId: string | undefined;
};

const playerColors = ['Black', 'White', 'Green', 'Purple'];

const RoomInfo: React.FC<RoomInfoProps> = ({
  roomId,
  players,
  roomSize,
  boardSize,
  currentPlayer,
  prisoners,
  gameState,
  socketId,
}) => {
  console.log('Player color: ', playerColors[players.indexOf(socketId || "")]);
  return (
    <div className={`room-info-card ${playerColors[players.indexOf(socketId || "")].toLowerCase()}`}>
      <h3 className="room-info-title">Room Information</h3>
      
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Room ID:</span>
          <span className="info-value">{roomId}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Status:</span>
          <span className={`info-value status-${gameState.toLowerCase()}`}>
            {gameState}
          </span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Players:</span>
          <span className="info-value">{players.length}/{roomSize}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Board:</span>
          <span className="info-value">{boardSize}x{boardSize}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Current Turn:</span>
          <span className={`info-value player-${currentPlayer.toLowerCase()}`}>
            {currentPlayer}
          </span>
        </div>
      </div>
      
      <div className="captures-section">
        <h4 className="captures-title">Captures</h4>
        <div className="captures-grid">
          {prisoners.map((count, index) => (
            <div key={index} className="capture-item">
              <span className={`capture-player player-${playerColors[index].toLowerCase()}`}>
                {playerColors[index] || `Player ${index + 1}`}
              </span>
              <span className="capture-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomInfo;