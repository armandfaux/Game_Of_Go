// components/StartGame.tsx
import React from 'react';
import { Socket } from 'socket.io-client';

type ResignProps = {
  socket: Socket | null;
  roomId: string;
};

const Resign: React.FC<ResignProps> = ({ socket, roomId }) => {
  const handlePassTurn = () => {
    if (socket && roomId) {
      socket.emit('resign', roomId);
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
                backgroundColor: '#f56262',
                color: 'white',
                cursor: 'pointer',
        }}
    >
      Resign
    </button>
  );
};

export default Resign;
