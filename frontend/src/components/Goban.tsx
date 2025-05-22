import React, { useEffect, useState } from 'react';
import './Goban.css';
import Intersection from './Intersection';
import { Socket } from 'socket.io-client';

interface GobanProps {
  socket: Socket;
  roomId: string;
  size: number;
}

type Stone = 'empty' | 'black' | 'white';

interface MoveMadePayload {
  position: { x: number; y: number };
  color: Stone;
  board: Number[][];
  currentPlayer: Stone;
  prisoners: { black: number; white: number };
}

// Return a list of the star points for the given size
function getStarPoints(size: number): { x: number; y: number }[] {
  if (size < 7) return [];

  const third = Math.floor(size / 3);
  const mid = Math.floor(size / 2);

  if (size === 9) {
    return [
      { x: 2, y: 2 }, { x: 6, y: 2 }, { x: 2, y: 6 },
      { x: 6, y: 6 }, { x: 4, y: 4 },
    ];
  }

  if (size === 13) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 3, y: 9 },
      { x: 9, y: 9 }, { x: 6, y: 6 },
    ];
  }

  if (size === 19) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
      { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
      { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 },
    ];
  }

  // Custom sizes
  return [
    { x: third, y: third },
    { x: size - 1 - third, y: third },
    { x: third, y: size - 1 - third },
    { x: size - 1 - third, y: size - 1 - third },
    { x: mid, y: mid },
  ];
}

const Goban: React.FC<GobanProps> = ({ socket, roomId, size }) => {
  const [board, setBoard] = useState<Stone[][]>(
    Array(size).fill(null).map(() => Array(size).fill('empty'))
  );
  const [lastMove, setLastMove] = useState<{ x: number; y: number } | null>(null);

  const starPoints = getStarPoints(size);

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
      setLastMove(data.position);
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
      const hasStarPoint = starPoints.some(p => p.x === x && p.y === y);
      intersections.push(
        <Intersection
          key={`${x}-${y}`}
          position={{ x, y }}
          socket={socket}
          roomId={roomId}
          state={board[x][y] || 'empty'} // default fallback
          isLastRow={y === size - 1}
          isLastCol={x === size - 1}
          isLastMove={lastMove?.x === x && lastMove?.y === y}
          hasStar={hasStarPoint}
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
