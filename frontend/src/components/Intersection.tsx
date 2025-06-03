import React from 'react';
import '../styles/Intersection.css';
import { Socket } from 'socket.io-client';

interface IntersectionProps {
  position: { x: number; y: number };
  socket: Socket;
  roomId: string;
  color: 'empty' | 'black' | 'white' | 'green' | 'purple';
  boardSize: number;
  isLastRow: boolean;
  isLastCol: boolean;
  isLastMove: boolean;
  hasStar: boolean;
  isKo: boolean;
  gameState: string;
  isMarked: boolean;
  isContested: boolean;
}

const Intersection: React.FC<IntersectionProps> = ({ position, socket, roomId, color, boardSize, isLastRow, isLastCol, isLastMove, hasStar, isKo, gameState, isMarked, isContested }) => {
  const handleClick = () => {
    if (gameState === 'playing') {
      socket.emit('makeMove', {roomId, position});
    }

    if (gameState === 'scoring') {
      socket.emit('markStone', { roomId, position });
    }
  };

  const cellClass = `intersection-cell ${isLastRow ? 'last-row' : ''} ${isLastCol ? 'last-col' : ''}`;

  return (
    <div className={cellClass} style={{ '--size': boardSize } as React.CSSProperties}>
      {hasStar && <div className="star-point" />}
      {/* {(gameState === 'playing') && ( */}

      <div
          className={`intersection-dot ${color} ${isLastMove ? 'last-move' : ''} ${isKo ? 'ko' : ''} ${isMarked ? 'marked' : ''} ${isContested ? 'contested' : ''}`}
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
              (gameState === 'playing' && color === 'empty') ? 'pointer' :
              (gameState === 'scoring' && color !== 'empty') ? 'pointer' : 'default'),
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
