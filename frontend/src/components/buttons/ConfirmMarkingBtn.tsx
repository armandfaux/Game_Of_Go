import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

type ConfirmMarkingBtnProps = {
  socket: Socket | null;
  roomId: string;
  isConfirmed: boolean;
};

const ConfirmMarkingBtn: React.FC<ConfirmMarkingBtnProps> = ({ socket, roomId, isConfirmed }) => {
  const handleConfirmMarking = () => {
    if (socket && roomId) {
      const newState = !isConfirmed;
      socket.emit('confirmMarking', roomId);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={handleConfirmMarking}
        disabled={!roomId}
        style={{
          padding: '8px 16px',
          fontSize: '0.9rem',
          borderRadius: '4px',
          border: isConfirmed ? '1px solid #2ecc71' : '1px solid #ddd',
          backgroundColor: isConfirmed ? '#f0f9f0' : 'white',
          color: isConfirmed ? '#2e7d32' : '#333',
          cursor: !roomId ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {isConfirmed ? 'Confirmed' : 'Confirm'}
      </button>

      {isConfirmed && (
        <div style={{
          fontSize: '0.8rem',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#2ecc71',
            marginRight: '6px',
          }} />
          Ready
        </div>
      )}
    </div>
  );
};

export default ConfirmMarkingBtn;