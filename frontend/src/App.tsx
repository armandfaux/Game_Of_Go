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
import { RoomInfoObj } from './types/gameTypes';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  // const [roomInfo, setRoomInfo] = useState<{ 
  //   roomId: string;
  //   roomSize?: number;
  //   players?: string[];
  //   boardSize?: number;
  //   board?: number[][];
  //   currentPlayer?: number;
  //   gameState: string;
  // } | null>(null);
  // const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  // const [prisoners, setPrisoners] = useState<number[]>([]);
  // const [koPosition, setKoPosition] = useState<{ x: number; y: number } | null>(null);
  // const [gobanLabel, setGobanLabel] = useState<string>('Goban');
  const [isConfirmed, setIsConfirmed] = useState(false);
  // const [scores, setScores] = useState<number[]>([]);

  const [roomInfo, setRoomInfo] = useState<RoomInfoObj>({
    id: '',
    roomSize: 0,
    players: [],
    currentPlayer: 1,
    boardSize: 0,
    board: [],
    prisoners: [],
    koPosition: null,
    playersConfirmed: [],
    scores: [],
    gameState: 'waiting',
  });

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

    socketInstance.on('stoneMarked', (data: {
    }) => {
      setIsConfirmed(false);
    });

    socketInstance.on('markingConfirmed', (data: RoomInfoObj) => {
      setRoomInfo(prevState => ({
        ...prevState,
        ...data,
      }));

      setIsConfirmed(
        socketInstance.id && data.playersConfirmed.includes(socketInstance.id) ? true : false
      )
    });

    socketInstance.on('updateRoomInfo', (data: RoomInfoObj) => {
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
            <CreateGameBtn socket={socket} />
            <JoinGameBtn socket={socket} />
          </div>
        )}
      </aside>
      <main className='main-panel'>
        {socket && roomInfo.gameState !== 'waiting' && (
        <div style={{margin: '35px'}}>
          <Goban
            socket={socket}
            roomInfo={roomInfo}
          />
        </div>
      )}
      </main>
      <aside className='right-panel'>
        {socket && roomInfo.id !== '' && (
          <div>
            <RoomInfo
              roomInfo={roomInfo}
              socketId={socket.id}
            />
          </div>
        )}
        {roomInfo && roomInfo.id !== '' && roomInfo.gameState === 'waiting' && (
          <div style={{ marginTop: '20px' }}>
            <StartGameBtn socket={socket} roomId={roomInfo.id} />
          </div>
        )}
        {roomInfo && roomInfo.gameState === 'playing' && (
          <div style={{ marginTop: '20px' }}>
            <PassTurnBtn socket={socket} roomId={roomInfo.id} />
            <ResignBtn socket={socket} roomId={roomInfo.id} />
          </div>
        )}
        {roomInfo && roomInfo.gameState === 'scoring' && (
          <div style={{ marginTop: '20px' }}>
            <ConfirmMarkingBtn socket={socket} roomId={roomInfo.id} isConfirmed={isConfirmed} />
          </div>
        )}
        {roomInfo && roomInfo.gameState === 'finished' && (
          // Display scores
          <div style={{ marginTop: '20px' }}>
            <h3>Game Over</h3>
            <p>Scores:</p>
            {roomInfo.scores.map((score, index) => (
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
