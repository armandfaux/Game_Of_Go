import React, { useState, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface JoinGameBtnProps {
  socket: Socket | null;
}

const JoinGameBtn: React.FC<JoinGameBtnProps> = ({ socket }) => {
  const [roomId, setRoomId] = useState('');

  const handleJoin = () => {
    if (socket && roomId.trim() !== '') {
      socket.emit('joinRoom', roomId.trim());
    } else {
      console.warn('No room ID or socket not connected');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '20px', marginLeft: '20px' }}>
        <button
            onClick={handleJoin}
            style={{
                padding: '8px 16px',
                fontSize: '1rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer',
            }}
            >
            Join Game
        </button>
        <input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{
            width: '140px',
            padding: '8px',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            }}
        />
    </div>
  );
};

export default JoinGameBtn;
