import React, { useEffect, useState } from 'react';
import '../styles/Goban.css';
import Intersection from './Intersection';
import { Socket } from 'socket.io-client';
import { Position, RoomInfoObj, Stone } from '../types/gameTypes';
import { getStarPoints } from '../utils/star_points';

interface GobanProps {
  socket: Socket;
  roomInfo: RoomInfoObj
}

interface MoveMadePayload {
  position: { x: number; y: number };
  color: Stone;
  board: number[][];
}

const Goban: React.FC<GobanProps> = ({ socket, roomInfo }) => {
  const [lastMove, setLastMove] = useState<{ x: number; y: number } | null>(null);
  const [markedStones, setMarkedStones] = useState<Position[][]>([[], []]);
  const starPoints = getStarPoints(roomInfo.boardSize);

  useEffect(() => {
    const handleMoveMade = (data: MoveMadePayload) => {
      if (data.board) {
        setLastMove(data.position);
      }
    };

    const handleStoneMarked = (data: { markedStones: Position[][] }) => {
        setMarkedStones(data.markedStones);
    };

    socket.on('updateRoomInfo', handleMoveMade);
    socket.on('stoneMarked', handleStoneMarked);

    return () => {
      socket.off('moveMade', handleMoveMade);
    };
  }, [socket]);

  const intersections = [];
  const playerIndex = roomInfo.players.indexOf(socket.id || '');

  for (let y = 0; y < roomInfo.boardSize; y++) {
    for (let x = 0; x < roomInfo.boardSize; x++) {

      const hasStarPoint = starPoints.some(p => p.x === x && p.y === y);
      let isMarked = false;
      let isContested = false;

      if (roomInfo.board[x][y] !== 0) {
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
          roomId={roomInfo.id}
          color={roomInfo.board[x][y] || 0}
          boardSize={roomInfo.boardSize}
          isLastRow={y === roomInfo.boardSize - 1}
          isLastCol={x === roomInfo.boardSize - 1}
          isLastMove={lastMove?.x === x && lastMove?.y === y}
          hasStar={hasStarPoint}
          isKo={roomInfo.koPosition?.x === x && roomInfo.koPosition?.y === y}
          gameState={roomInfo.gameState}
          isMarked={isMarked}
          isContested={isContested}
        />
      );
    }
  }

  return (
    <div>
      <h3 className="goban-label">
        {
          roomInfo.gameState === 'waiting' ? 'Waiting for players...' :
          roomInfo.gameState === 'playing' ? 'Game has started' :
          roomInfo.gameState === 'scoring' ? 'Mark the dead stones' :
          roomInfo.gameState === 'finished' ? `won the game` : ''
        }
      </h3>
    <div className={`goban ${roomInfo.gameState}`} style={{ '--size': roomInfo.boardSize } as React.CSSProperties}>
      {intersections}
    </div>
    </div>
  );
};

export default Goban;
