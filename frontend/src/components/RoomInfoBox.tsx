// components/RoomInfo.tsx
import React from 'react';
import '../styles/RoomInfo.css';
import { RoomInfoObj } from '../types/gameTypes';

type RoomInfoBoxProps = {
  socketId: string | undefined;
  roomInfo: RoomInfoObj
};

const playerColors = ['Black', 'White', 'Green', 'Purple'];

const RoomInfoBox: React.FC<RoomInfoBoxProps> = ({
  roomInfo,
  socketId,
}) => {

  const playerClass = socketId ? playerColors[roomInfo.players.indexOf(socketId || "")].toLowerCase() : '';
  return (
    <div className={`room-info-card ${playerClass}`}>
      <h3 className="room-info-title">Room Information</h3>
      
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Room ID:</span>
          <span className="info-value">{roomInfo.id}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Status:</span>
          <span className={`info-value status-${roomInfo.gameState.toLowerCase()}`}>
            {roomInfo.gameState}
          </span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Players:</span>
          <span className="info-value">{roomInfo.players.length}/{roomInfo.roomSize}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Board:</span>
          <span className="info-value">{roomInfo.boardSize}x{roomInfo.boardSize}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Current Turn:</span>
          <span className={`info-value player-${playerColors[roomInfo.currentPlayer - 1].toLowerCase()}`}>
            {playerColors[roomInfo.currentPlayer - 1]}
          </span>
        </div>
      </div>
      
      <div className="captures-section">
        <h4 className="captures-title">Captures</h4>
        <div className="captures-grid">
          {roomInfo.prisoners.map((count, index) => (
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

export default RoomInfoBox;