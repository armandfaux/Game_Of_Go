// components/StartGame.tsx
import React from 'react';
import { Socket } from 'socket.io-client';

type StartGameBtnProps = {
  socket: Socket | null;
  roomId: string;
};

const StartGameBtn: React.FC<StartGameBtnProps> = ({ socket, roomId }) => {
  const handleStartGame = () => {
    if (socket && roomId) {
      socket.emit('startGame', roomId);
    }
  };

  return (
    <button
        onClick={handleStartGame} disabled={!roomId}
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
      Start Game
    </button>
  );
};

export default StartGameBtn;
