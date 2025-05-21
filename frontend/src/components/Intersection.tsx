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
}

const Intersection: React.FC<IntersectionProps> = ({ position, socket, roomId, state, isLastRow, isLastCol }) => {
  const handleClick = () => {
    console.log(`Clicked on: ${position.x}, ${position.y}`);
    socket.emit('makeMove', {roomId, position});
  };

  const cellClass = `intersection-cell ${isLastRow ? 'last-row' : ''} ${isLastCol ? 'last-col' : ''}`;

  return (
    <div className={cellClass}>
    <button className={`intersection-dot ${state}`} onClick={handleClick}/>
    </div>
  );
};

export default Intersection;
