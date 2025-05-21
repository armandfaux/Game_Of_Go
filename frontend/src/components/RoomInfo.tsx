// components/RoomInfo.tsx
import React from 'react';

type RoomInfoProps = {
  roomId: string;
  boardSize: number;
  currentPlayer: string;
};

const RoomInfo: React.FC<RoomInfoProps> = ({ roomId, boardSize, currentPlayer: playerTurn }) => {
  return (
    <div>
      <h3>Room Information</h3>
      <p><strong>Room ID:</strong> {roomId}</p>
      <p><strong>Board size:</strong> {boardSize}</p>
      <p><strong>{playerTurn}</strong> to play</p>
    </div>
  );
};

export default RoomInfo;
