// components/RoomInfo.tsx
import React from 'react';

type RoomInfoProps = {
  roomId: string;
  boardSize: number;
};

const RoomInfo: React.FC<RoomInfoProps> = ({ roomId, boardSize: boardSize }) => {
  return (
    <div>
      <h3>Room Information</h3>
      <p><strong>Room ID:</strong> {roomId}</p>
      <p><strong>Board size:</strong> {boardSize}</p>
    </div>
  );
};

export default RoomInfo;
