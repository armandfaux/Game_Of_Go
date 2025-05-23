import React from 'react';
import './Intersection.css';
import { Socket } from 'socket.io-client';

interface IntersectionProps {
  position: { x: number; y: number };
  socket: Socket;
  roomId: string;
  state: 'empty' | 'black' | 'white';
  isLastRow: boolean;
  isLastCol: boolean;
  isLastMove: boolean;
  hasStar: boolean;
  isKo: boolean;
}

const Intersection: React.FC<IntersectionProps> = ({ position, socket, roomId, state, isLastRow, isLastCol, isLastMove, hasStar, isKo }) => {
  const handleClick = () => {
    socket.emit('makeMove', {roomId, position});
  };

  const cellClass = `intersection-cell ${isLastRow ? 'last-row' : ''} ${isLastCol ? 'last-col' : ''}`;

  return (
    <div className={cellClass}>
      {hasStar && <div className="star-point" />}
      <button
        className={`intersection-dot ${state} ${isLastMove ? 'last-move' : ''} ${isKo ? 'ko' : ''}`}
        onClick={handleClick}
      >
        {/* {isKo && <span className="ko-label">KO</span>} */}
      </button>
    </div>
  );
};

export default Intersection;
