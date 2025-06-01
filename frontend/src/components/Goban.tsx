import React, { useEffect, useState } from 'react';
import '../styles/Goban.css';
import Intersection from './Intersection';
import { Socket } from 'socket.io-client';
import { Stone } from '../types/gameTypes';
import { getStarPoints } from '../utils/starPoints';

interface GobanProps {
  socket: Socket;
  roomId: string;
  gameState: string;
  boardSize: number;
  koPosition: { x: number; y: number } | null;
  gobanLabel: string;
}

interface MoveMadePayload {
  position: { x: number; y: number };
  color: Stone;
  board: number[][];
  // currentPlayer: Stone;
  // prisoners: { black: number; white: number };
}

// Convert server board from number[][] to Stone[][]
function convertBoard(board: number[][]): Stone[][] {
  return board.map(row =>
    row.map(value => {
      if (value === 1) return 'black';
      if (value === 2) return 'white';
      if (value === 3) return 'green';
      if (value === 4) return 'purple';
      return 'empty';
    })
  );
}

const Goban: React.FC<GobanProps> = ({ socket, roomId, gameState, boardSize, koPosition, gobanLabel }) => {
  const [board, setBoard] = useState<Stone[][]>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill('empty'))
  );
  const [lastMove, setLastMove] = useState<{ x: number; y: number } | null>(null);

  const [markedStones, setMarkedStones] = useState<{ x: number; y: number }[]>([]);
  
  const starPoints = getStarPoints(boardSize);

  useEffect(() => {
    const handleMoveMade = (data: MoveMadePayload) => {
      if (data.board) {
        setBoard(convertBoard(data.board));
        setLastMove(data.position);
      }
    };

    // const handleGameStarted = (data: { board: number[][] }) => {
    //   if (data.board) {
    //     setBoard(convertBoard(data.board));
    //   }
    // }

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
          color={board[x][y] || 'empty'}
          isLastRow={y === boardSize - 1}
          isLastCol={x === boardSize - 1}
          isLastMove={lastMove?.x === x && lastMove?.y === y}
          hasStar={hasStarPoint}
          isKo={koPosition?.x === x && koPosition?.y === y}
          gameState={gameState}
        />
      );
    }
  }

  return (
    <div>
      <h3 className="goban-label">
        {gobanLabel}
      </h3>
    <div className={`goban ${gameState}`} style={{ '--size': boardSize } as React.CSSProperties}>
      {intersections}
    </div>
    </div>
  );
};

export default Goban;
