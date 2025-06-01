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
    currentPlayer?: number;
    gameState: string;
  } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [prisoners, setPrisoners] = useState<number[]>([]);
  const [koPosition, setKoPosition] = useState<{ x: number; y: number } | null>(null);
  const [gobanLabel, setGobanLabel] = useState<string>('Goban');

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
      prisoners: number[],
      gameState: string;
    }) => {
      console.log(`[EVENT] Room ${data.roomId} created with size ${data.boardSize}`, data.gameState);
      setRoomInfo(data);
      setPrisoners(data.prisoners);
      setGobanLabel('Waiting for players');
    });

    socketInstance.on('playerJoined', (data: {
      playerId: string;
      roomId: string,
      roomSize: number,
      players: string[];
      boardSize: number,
      currentPlayer: number,
      prisoners: number[],
      gameState: string;
    }) => {
      console.log(`[EVENT] Player ${data.playerId} joined room ${data.roomId}`);
      setRoomInfo(prevState => ({
          ...prevState,
          ...data,
        }));
      setPrisoners(data.prisoners);
      setCurrentPlayer(data.currentPlayer);
      setGobanLabel('Waiting for players');
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
        setGobanLabel('Game in progress');
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

    socketInstance.on('gameScoring', (data: {
      roomId: string,
      gameState: string,
    }) => {
      setRoomInfo(prevState => ({
        ...prevState,
        ...data,
      }));
      setGobanLabel('Mark the dead stones');
    });

    socketInstance.on('gameFinished', (data: {
      roomId: string,
      gameState: string,
    }) => {
      setRoomInfo(prevState => ({
        ...prevState,
        ...data,
      }));
    });

// ----------------------------------------------------------------------------------------------------------

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <aside className='left-panel'>
        { socket && (
          <div>
            <CreateGame socket={socket} />
            <JoinGame socket={socket} />
          </div>
        )}
      </aside>
      <main className='main-panel'>
        {currentPlayer && socket && roomInfo && roomInfo.boardSize && roomInfo.gameState !== 'waiting' && (
        <div style={{margin: '35px'}}>
          <Goban
            socket={socket}
            roomId={roomInfo.roomId}
            gameState={roomInfo.gameState}
            boardSize={roomInfo.boardSize}
            koPosition={koPosition}
            gobanLabel={gobanLabel}
          />
        </div>
      )}
      </main>
      <aside className='right-panel'>
        {roomInfo && roomInfo.roomSize && roomInfo.boardSize && socket && (
          <div>
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
                'Other'
              }
              prisoners={prisoners}
              gameState={roomInfo.gameState}
              socketId={socket.id}
            />
          </div>
        )}
        {roomInfo && roomInfo.gameState === 'waiting' && (
          <div style={{ marginTop: '20px' }}>
            <StartGame socket={socket} roomId={roomInfo.roomId} />
          </div>
        )}
        {roomInfo && roomInfo.gameState === 'playing' && (
          <div style={{ marginTop: '20px' }}>
            <PassTurn socket={socket} roomId={roomInfo.roomId} />
            <Resign socket={socket} roomId={roomInfo.roomId} />
          </div>
        )}
      </aside>
    </div>
  );
}

export default App;
