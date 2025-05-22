import React from 'react';
import { Socket } from 'socket.io-client';

interface CreateGameProps {
  socket: Socket | null;
}

const CreateGame: React.FC<CreateGameProps> = ({ socket }) => {
  const handleCreateRoom = () => {
    if (socket) {
      socket.emit('createRoom', 2, 19);
    } else {
      console.warn('Socket not connected');
    }
  };

  return (
    <button
      onClick={handleCreateRoom}
      style={{
        marginTop: '20px',
        marginLeft: '20px',
        padding: '8px 16px',
        fontSize: '1rem',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#28a745',
        color: 'white',
        cursor: 'pointer',
      }}
    >
      Create Room
    </button>
  );
};

export default CreateGame;
