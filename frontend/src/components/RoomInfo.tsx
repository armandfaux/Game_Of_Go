// components/RoomInfo.tsx
import React from 'react';

type RoomInfoProps = {
  roomId: string,
  players: string[],
  roomSize: number,
  boardSize: number,
  currentPlayer: string,
  prisoners: { black: number; white: number },
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
        <li>Black: {prisoners.black}</li>
        <li>White: {prisoners.white}</li>
      </ul>
    </div>
  );
};

export default RoomInfo;
