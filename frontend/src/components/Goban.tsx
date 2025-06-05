import React, { useEffect, useState } from 'react';
import '../styles/Goban.css';
import Intersection from './Intersection';
import { Socket } from 'socket.io-client';
import { Position, Stone } from '../types/gameTypes';
import { getStarPoints } from '../utils/starPoints';

interface GobanProps {
  socket: Socket;
  roomId: string;
  players: string[];
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

const Goban: React.FC<GobanProps> = ({ socket, roomId, players, gameState, boardSize, koPosition, gobanLabel }) => {
  const [board, setBoard] = useState<Stone[][]>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill('empty'))
  );
  const [lastMove, setLastMove] = useState<{ x: number; y: number } | null>(null);

  const [markedStones, setMarkedStones] = useState<Position[][]>([[], []]);
  
  const starPoints = getStarPoints(boardSize);

  useEffect(() => {
    const handleMoveMade = (data: MoveMadePayload) => {
      if (data.board) {
        setBoard(convertBoard(data.board));
        setLastMove(data.position);
      }
    };

    const handleStoneMarked = (data: { markedStones: Position[][] }) => {
        setMarkedStones(data.markedStones);
    };

    socket.on('moveMade', handleMoveMade);
    socket.on('stoneMarked', handleStoneMarked);

    return () => {
      socket.off('moveMade', handleMoveMade);
    };
  }, [socket]);

  const intersections = [];
  const playerIndex = players.indexOf(socket.id || '');

  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {

      const hasStarPoint = starPoints.some(p => p.x === x && p.y === y);
      let isMarked = false;
      let isContested = false;

      if (gameState === 'scoring' && board[x][y] !== 'empty') {
        if (playerIndex >= 0 && playerIndex < markedStones.length) {
          isMarked = markedStones[playerIndex].some(pos => pos.x === x && pos.y === y);
        }
        isContested = !markedStones.every(subArray => 
          subArray.some(pos => pos.x === x && pos.y === y)) &&
          markedStones.some(array => array.some(pos => pos.x === x && pos.y === y));
      }

      intersections.push(
        <Intersection
          key={`${x}-${y}`}
          position={{ x, y }}
          socket={socket}
          roomId={roomId}
          color={board[x][y] || 'empty'}
          boardSize={boardSize}
          isLastRow={y === boardSize - 1}
          isLastCol={x === boardSize - 1}
          isLastMove={lastMove?.x === x && lastMove?.y === y}
          hasStar={hasStarPoint}
          isKo={koPosition?.x === x && koPosition?.y === y}
          gameState={gameState}
          isMarked={isMarked}
          isContested={isContested}
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
