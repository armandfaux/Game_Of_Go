import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';
import Goban from './components/Goban';
import JoinGame from './components/JoinGame';
import CreateGame from './components/CreateGame';
import RoomInfo from './components/RoomInfo';
import StartGame from './components/StartGame';
import PassTurn from './components/PassTurn';
import Resign from './components/Resign';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomInfo, setRoomInfo] = useState<{ 
    roomId: string;
    roomSize?: number;
    players?: string[];
    boardSize?: number;
    board?: number[][];
    currentPlayer: number;
    gameState: string;
  } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [prisoners, setPrisoners] = useState<number[]>([0, 0, 0, 0]);
  const [koPosition, setKoPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    console.log('[INFO] websocket address: ', process.env.REACT_APP_WS_URL);
    
    // PRODUCTION
    // const socketInstance = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001');

    // DEVELOPMENT
    const socketInstance = io('http://localhost:3001');

    // Enable React auto rendering on socket events
    setSocket(socketInstance);

// Socket events listeners
// ----------------------------------------------------------------------------------------------------------

    socketInstance.on('connected', () => {
      console.log('[SERVER] Connected to server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[ERROR]', error);
    });

    socketInstance.on('roomCreated', (data: { 
      roomId: string;
      roomSize: number,
      players: string[];
      boardSize: number,
      currentPlayer: number,
      gameState: string;
    }) => {
      console.log(`[EVENT] Room ${data.roomId} created with size ${data.boardSize}`, data.gameState);
      setRoomInfo(data);
    });

    socketInstance.on('playerJoined', (data: {
      playerId: string;
      roomId: string,
      roomSize: number,
      players: string[];
      boardSize: number,
      currentPlayer: number,
      gameState: string;
    }) => {
      console.log(`[EVENT] Player ${data.playerId} joined room ${data.roomId}`);
      setRoomInfo(data);
      setCurrentPlayer(data.currentPlayer);
    });

    socketInstance.on('gameStarted', (data: {
      roomId: string;
      currentPlayer: number
      gameState: string;
    }) => {
      console.log('[EVENT] Game started', data.gameState);
      // set roomInfo current player and game state
        setRoomInfo(prevState => ({
          ...prevState,
          ...data,
        }));
    });

    socketInstance.on('moveMade', (data: { 
      currentPlayer: number,
      prisoners: number[],
      koPosition: {x: number, y: number}
    }) => {
      setCurrentPlayer(data.currentPlayer);
      setPrisoners(data.prisoners);
      setKoPosition(data.koPosition);
    });

    socketInstance.on('turnPassed', (data: {
      currentPlayer: number,
    }) => {
      setCurrentPlayer(data.currentPlayer);
    });

// ----------------------------------------------------------------------------------------------------------

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <div className="App">
      {socket && (
        <div className="top-left">
          <CreateGame socket={socket} />
          <JoinGame socket={socket} />
        </div>
      )}
      {roomInfo && roomInfo.roomSize && roomInfo.boardSize && (
        <div className="top-right">
          <RoomInfo
            roomId={roomInfo.roomId}
            players={roomInfo.players || []}
            roomSize={roomInfo.roomSize}
            boardSize={roomInfo.boardSize}
            currentPlayer={
              currentPlayer === 1 ? 'Black' :
              currentPlayer === 2 ? 'White' :
              currentPlayer === 3 ? 'Green' :
              currentPlayer === 4 ? 'Purple' :
              '?'
            }
            prisoners={prisoners}
            gameState={roomInfo.gameState}
          />
        </div>
      )}
      {roomInfo && roomInfo.gameState === 'waiting' && (
        <div className="mid-right">
          <StartGame socket={socket} roomId={roomInfo.roomId} />
          
        </div>
      )}
      {roomInfo && roomInfo.gameState === 'playing' && (
        <div className="mid-right">
          <PassTurn socket={socket} roomId={roomInfo.roomId} />
          <Resign socket={socket} roomId={roomInfo.roomId} />
        </div>
      )}
      {currentPlayer && socket && roomInfo && roomInfo.boardSize && roomInfo.gameState !== 'waiting' && (
        <div className="goban-container">
          <Goban
            socket={socket}
            roomId={roomInfo.roomId}
            boardSize={roomInfo.boardSize}
            koPosition={koPosition}
          />
        </div>
      )}
    </div>
  );
}

export default App;
