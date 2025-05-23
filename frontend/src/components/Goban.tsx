import React, { useEffect, useState } from 'react';
import './Goban.css';
import Intersection from './Intersection';
import { Socket } from 'socket.io-client';

interface GobanProps {
  socket: Socket;
  roomId: string;
  boardSize: number;
  koPosition: { x: number; y: number } | null;
}

type Stone = 'empty' | 'black' | 'white';

interface MoveMadePayload {
  position: { x: number; y: number };
  color: Stone;
  board: Number[][];
  // currentPlayer: Stone;
  // prisoners: { black: number; white: number };
}

// Return a list of the star points for the given size
function getStarPoints(boardSize: number): { x: number; y: number }[] {
  if (boardSize < 7) return [];

  const third = Math.floor(boardSize / 3);
  const mid = Math.floor(boardSize / 2);

  if (boardSize === 9) {
    return [
      { x: 2, y: 2 }, { x: 6, y: 2 }, { x: 2, y: 6 },
      { x: 6, y: 6 }, { x: 4, y: 4 },
    ];
  }

  if (boardSize === 13) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 3, y: 9 },
      { x: 9, y: 9 }, { x: 6, y: 6 },
    ];
  }

  if (boardSize === 19) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
      { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
      { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 },
    ];
  }

  // Custom sizes
  return [
    { x: third, y: third },
    { x: boardSize - 1 - third, y: third },
    { x: third, y: boardSize - 1 - third },
    { x: boardSize - 1 - third, y: boardSize - 1 - third },
    { x: mid, y: mid },
  ];
}

const Goban: React.FC<GobanProps> = ({ socket, roomId, boardSize, koPosition }) => {
  const [board, setBoard] = useState<Stone[][]>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill('empty'))
  );
  const [lastMove, setLastMove] = useState<{ x: number; y: number } | null>(null);

  const starPoints = getStarPoints(boardSize);

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
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const hasStarPoint = starPoints.some(p => p.x === x && p.y === y);
      intersections.push(
        <Intersection
          key={`${x}-${y}`}
          position={{ x, y }}
          socket={socket}
          roomId={roomId}
          state={board[x][y] || 'empty'} // default fallback
          isLastRow={y === boardSize - 1}
          isLastCol={x === boardSize - 1}
          isLastMove={lastMove?.x === x && lastMove?.y === y}
          hasStar={hasStarPoint}
          isKo={koPosition?.x === x && koPosition?.y === y}
        />
      );
    }
  }

  return (
    <div className="goban" style={{ '--size': boardSize } as React.CSSProperties}>
      {intersections}
    </div>
  );
};

export default Goban;
