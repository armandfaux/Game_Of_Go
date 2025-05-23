import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';
import Goban from './components/Goban';
import JoinGame from './components/JoinGame';
import CreateGame from './components/CreateGame';
import RoomInfo from './components/RoomInfo';
import StartGame from './components/StartGame';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomInfo, setRoomInfo] = useState<{ 
    roomId: string;
    boardSize: number;
    board?: number[][];
    currentPlayer: string;
  } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string>('black');
  const [prisoners, setPrisoners] = useState<{ black: number; white: number }>({ black: 0, white: 0 });
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

      boardSize: number,
      currentPlayer: string,
    }) => {
      console.log(`[EVENT] Room ${data.roomId} created, size : ${data.boardSize}`);
      setRoomInfo(data);
    });

    socketInstance.on('joinedRoom', (data: {
      roomId: string,
      boardSize: number,
      currentPlayer: string,
    }) => {
      console.log(`[EVENT] Room ${data.roomId} joined`);
      setRoomInfo(data);
      setCurrentPlayer(data.currentPlayer);
    });

    socketInstance.on('gameStarted', (data: {
      board: number[][];
      currentPlayer: string
    }) => {
      console.log('[EVENT] Game started');
      setCurrentPlayer(data.currentPlayer);
    });

    socketInstance.on('moveMade', (data: { 
      currentPlayer: string,
      prisoners: {black: number, white: number},
      koPosition: {x: number, y: number}
    }) => {
      console.log('ko position', data.koPosition);
      setCurrentPlayer(data.currentPlayer);
      setPrisoners(data.prisoners);
      setKoPosition(data.koPosition);
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
      {roomInfo && (
        <div className="top-right">
          <RoomInfo roomId={roomInfo.roomId} boardSize={roomInfo.boardSize} currentPlayer={currentPlayer} prisoners={prisoners} />
          <StartGame socket={socket} roomId={roomInfo.roomId} />
        </div>
      )}
      {currentPlayer && socket && roomInfo && (
        <div className="goban-container">
          <Goban socket={socket} roomId={roomInfo.roomId} boardSize={roomInfo.boardSize} koPosition={koPosition}></Goban>
        </div>
      )}
    </div>
  );
}

export default App;
