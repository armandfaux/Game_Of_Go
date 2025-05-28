import React from 'react';
import '../styles/Intersection.css';
import { Socket } from 'socket.io-client';

interface IntersectionProps {
  position: { x: number; y: number };
  socket: Socket;
  roomId: string;
  color: 'empty' | 'black' | 'white' | 'green' | 'purple';
  isLastRow: boolean;
  isLastCol: boolean;
  isLastMove: boolean;
  hasStar: boolean;
  isKo: boolean;
  gameState: string;
}

const Intersection: React.FC<IntersectionProps> = ({ position, socket, roomId, color: state, isLastRow, isLastCol, isLastMove, hasStar, isKo, gameState }) => {
  const handleClick = () => {
    socket.emit('makeMove', {roomId, position});
  };

  const cellClass = `intersection-cell ${isLastRow ? 'last-row' : ''} ${isLastCol ? 'last-col' : ''}`;

  return (
    <div className={cellClass}>
      {hasStar && <div className="star-point" />}
      {/* {(gameState === 'playing') && ( */}

      <div
          className={`intersection-dot ${state} ${isLastMove ? 'last-move' : ''} ${isKo ? 'ko' : ''}`}
          style={{ '--hover-opacity': gameState === 'playing' ? 0.5 : 0 } as React.CSSProperties}
      >
        <button
        style={
          {
            backgroundColor: 'transparent',
            border: 'none',
            width: '100%',
            height: '100%',
            cursor: (
              (gameState === 'playing' && state === 'empty') ? 'pointer' :
              (gameState === 'scoring' && state !== 'empty') ? 'pointer' : 'default'),
          }
        }
          onClick={handleClick}
        >
          {/* {isKo && <span className="ko-label">KO</span>} */}
        </button>
      </div>
      {/* )} */}
    </div>
  );
};

export default Intersection;
