import React from 'react';
import './Intersection.css';
import { Socket } from 'socket.io-client';

interface IntersectionProps {
  position: { x: number; y: number };
  socket: Socket;
  roomId: string;
  state: 'empty' | 'black' | 'white';
}

const Intersection: React.FC<IntersectionProps> = ({ position, socket, roomId, state }) => {
  const handleClick = () => {
    console.log(`Clicked on: ${position.x}, ${position.y}`);
    socket.emit('makeMove', {roomId, position});
  };

  return (
    <div className="intersection-cell">
      <button className={`intersection-dot ${state}`} onClick={handleClick}/>
    </div>
  );
};

export default Intersection;
