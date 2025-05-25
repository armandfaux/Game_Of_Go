// components/StartGame.tsx
import React from 'react';
import { Socket } from 'socket.io-client';

type PassTurnProps = {
  socket: Socket | null;
  roomId: string;
};

const PassTurn: React.FC<PassTurnProps> = ({ socket, roomId }) => {
  const handlePassTurn = () => {
    if (socket && roomId) {
      socket.emit('passTurn', roomId);
    }
  };

  return (
    <button
        onClick={handlePassTurn} disabled={!roomId}
        style={{
                marginTop: '16px',
                width: '120px',
                padding: '8px 16px',
                fontSize: '1rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#ba9c56',
                color: 'white',
                cursor: 'pointer',
        }}
    >
      Pass Turn
    </button>
  );
};

export default PassTurn;
