import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

interface CreateGameProps {
  socket: Socket | null;
}

const CreateGame: React.FC<CreateGameProps> = ({ socket }) => {
  const [boardSize, setBoardSize] = useState<number>(19); // Default to 19x19

  const handleCreateRoom = () => {
    if (socket) {
      socket.emit('createRoom', { roomSize: 2, boardSize });
    } else {
      console.warn('Socket not connected');
    }
  };

  const handleBoardSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBoardSize(Number(e.target.value));
  };

  return (
    <div style={{
      marginTop: '20px',
      marginLeft: '20px',
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }}>
      <button
        onClick={handleCreateRoom}
        style={{
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
      <select
        value={boardSize}
        onChange={handleBoardSizeChange}
        style={{
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '1rem'
        }}
      >
        <option value={9}>9×9</option>
        <option value={13}>13×13</option>
        <option value={19}>19×19</option>
      </select>
    </div>
  );
};

export default CreateGame;