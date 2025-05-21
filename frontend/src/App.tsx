import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';
import Goban from './components/Goban';
import JoinGame from './components/JoinGame';
import CreateGame from './components/CreateGame';
import RoomInfo from './components/RoomInfo';
import StartGame from './components/StartGame';

function App() {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomInfo, setRoomInfo] = useState<{ roomId: string; boardSize: number } | null>(null);
  const [board, setBoard] = useState<number[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = io('http://127.0.0.1:3001');
    socketRef.current = socketInstance;
    setSocket(socketInstance); // ← trigger re-render with the socket

    // Socket connection events
    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    socketInstance.on('connected', () => {
      console.log('[SERVER] Connected to server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket Connect Error]', error);
    });

    // Room events
    socketInstance.on('roomCreated', (data: { roomId: string; boardSize: number }) => {
      console.log('[EVENT] Room created by server:', data);
      setRoomInfo(data);
    });

    socketRef.current.on('joinedRoom', (data: { roomId: string; boardSize: number }) => {
      console.log('[EVENT] Joined room:', data);
      setRoomInfo(data);
    });

    socketRef.current.on('gameStarted', (data: { board: number[][]; currentPlayer: string }) => {
      console.log('[EVENT] Game started ! ', data);
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
    });

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
          <RoomInfo roomId={roomInfo.roomId} boardSize={roomInfo.boardSize} />
          <StartGame socket={socket} roomId={roomInfo.roomId} />
        </div>
      )}
      {currentPlayer && socket && roomInfo && (
        <div className="goban-container">
          <Goban socket={socket} roomId={roomInfo.roomId}></Goban>
        </div>
      )}
    </div>
  );
}

export default App;
