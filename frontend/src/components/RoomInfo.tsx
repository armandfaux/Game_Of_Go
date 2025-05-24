// components/RoomInfo.tsx
import React from 'react';

type RoomInfoProps = {
  roomId: string,
  players: string[],
  roomSize: number,
  boardSize: number,
  currentPlayer: 'Black' | 'White' | 'Green' | 'Purple' | '?',
  prisoners: number[],
};

const RoomInfo: React.FC<RoomInfoProps> = ({ roomId, players, roomSize, boardSize, currentPlayer, prisoners }) => {
  return (
    <div>
      <h3>Room Information</h3>
      <p><strong>Room ID:</strong> {roomId}</p>
      <p><strong>{players.length}/{roomSize} players</strong></p>
      <p><strong>Board size:</strong> {boardSize}</p>
      <p><strong>{currentPlayer}</strong> to play</p>
      <p><strong>Prisoners:</strong></p>
      <ul>
        <li>Black: {prisoners[0]}</li>
        <li>White: {prisoners[1]}</li>
      </ul>
    </div>
  );
};

export default RoomInfo;
