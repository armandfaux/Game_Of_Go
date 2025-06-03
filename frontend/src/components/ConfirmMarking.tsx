// components/StartGame.tsx
import React from 'react';
import { Socket } from 'socket.io-client';

type StartGameProps = {
  socket: Socket | null;
  roomId: string;
};

const StartGame: React.FC<StartGameProps> = ({ socket, roomId }) => {
  const handleConfirmMarking = () => {
    if (socket && roomId) {
      socket.emit('confirmMarking', roomId);
    }
  };

  return (
    <button
        onClick={handleConfirmMarking} disabled={!roomId}
        style={{
                padding: '8px 16px',
                fontSize: '1rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#0077ff',
                color: 'white',
                cursor: 'pointer',
        }}
    >
      Confirm
    </button>
  );
};

export default StartGame;
