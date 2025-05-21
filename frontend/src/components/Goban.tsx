import React, { useEffect, useState } from 'react';
import './Goban.css';
import Intersection from './Intersection';
import { Socket } from 'socket.io-client';

interface GobanProps {
  socket: Socket;
  roomId: string;
  size?: number; // Default to 19x19
}

type Stone = 'empty' | 'black' | 'white';

interface MoveMadePayload {
  position: { x: number; y: number };
  color: Stone;
  board: Number[][];
  currentPlayer: Stone;
  prisoners: { black: number; white: number };
}

const Goban: React.FC<GobanProps> = ({ socket, roomId, size = 19 }) => {
  const [board, setBoard] = useState<Stone[][]>(
    Array(size).fill(null).map(() => Array(size).fill('empty'))
  );

  useEffect(() => {
    const handleMoveMade = (data: MoveMadePayload) => {
  console.log('Move made:', data);
  if (data.board) {
    // Convert server board from number[][] to Stone[][]
    const convertedBoard: Stone[][] = data.board.map(row =>
      row.map(value => {
        if (value === 1) return 'black';
        if (value === 2) return 'white';
        return 'empty';
      })
    );
    setBoard(convertedBoard);
  }
};

    socket.on('moveMade', handleMoveMade);
    return () => {
      socket.off('moveMade', handleMoveMade);
    };
  }, [socket]);

  const intersections = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      intersections.push(
        <Intersection
          key={`${x}-${y}`}
          position={{ x, y }}
          socket={socket}
          roomId={roomId}
          state={board[x][y] || 'empty'} // default fallback
          isLastRow={y === size - 1}
          isLastCol={x === size - 1}
        />
      );
    }
  }

  return (
    <div className="goban" style={{ '--size': size } as React.CSSProperties}>
      {intersections}
    </div>
  );
};

export default Goban;
