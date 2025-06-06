import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';
import Goban from './components/Goban';
import JoinGameBtn from './components/buttons/JoinGameBtn';
import CreateGameBtn from './components/buttons/CreateGameBtn';
import RoomInfo from './components/RoomInfo';
import StartGameBtn from './components/buttons/StartGameBtn';
import PassTurnBtn from './components/buttons/PassTurnBtn';
import ResignBtn from './components/buttons/ResignBtn';
import ConfirmMarkingBtn from './components/buttons/ConfirmMarkingBtn';

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
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

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

    socketInstance.on('stoneMarked', (data: {
    }) => {
      setIsConfirmed(false);
    });

    socketInstance.on('markingConfirmed', (data: {
      roomId: string,
      gameState: string,
      playersConfirmed: string[],
    }) => {
      setRoomInfo(prevState => ({
        ...prevState,
        ...data,
      }));

      setIsConfirmed(
        socketInstance.id && data.playersConfirmed.includes(socketInstance.id) ? true : false
      )
    });

    socketInstance.on('gameFinished', (data: {
      roomId: string,
      board: number[][],
      gameState: string
      scores: number[],
    }) => {
      console.log('[EVENT] Game finished', data.gameState);
      setRoomInfo(prevState => ({
        ...prevState,
        ...data,
      }));
      setScores(data.scores);
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
            <CreateGameBtn socket={socket} />
            <JoinGameBtn socket={socket} />
          </div>
        )}
      </aside>
      <main className='main-panel'>
        {currentPlayer && socket && roomInfo && roomInfo.boardSize && roomInfo.gameState !== 'waiting' && (
        <div style={{margin: '35px'}}>
          <Goban
            socket={socket}
            roomId={roomInfo.roomId}
            players={roomInfo.players || []}
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
            <StartGameBtn socket={socket} roomId={roomInfo.roomId} />
          </div>
        )}
        {roomInfo && roomInfo.gameState === 'playing' && (
          <div style={{ marginTop: '20px' }}>
            <PassTurnBtn socket={socket} roomId={roomInfo.roomId} />
            <ResignBtn socket={socket} roomId={roomInfo.roomId} />
          </div>
        )}
        {roomInfo && roomInfo.gameState === 'scoring' && (
          <div style={{ marginTop: '20px' }}>
            <ConfirmMarkingBtn socket={socket} roomId={roomInfo.roomId} isConfirmed={isConfirmed} />
          </div>
        )}
        {roomInfo && roomInfo.gameState === 'finished' && (
          // Display scores
          <div style={{ marginTop: '20px' }}>
            <h3>Game Over</h3>
            <p>Scores:</p>
            {scores.map((score, index) => (
              <p key={index}>
                Player {index + 1}: {score} points
              </p>
            ))}

          </div>
        )}
      </aside>
    </div>
  );
}

export default App;
