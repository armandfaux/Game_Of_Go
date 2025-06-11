import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomInfoObj } from './types/gameTypes';

import LeftPanel from './components/LeftPanel';
import MainContent from './components/MainContent';
import RightPanel from './components/RightPanel';

import './styles/App.css';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
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
    territoryScores: [],
    gameState: 'waiting',
  });

  useEffect(() => {
    console.log('[INFO] websocket address: ', process.env.REACT_APP_WS_URL);
    
    // PRODUCTION
    const socketInstance = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001');

    // DEVELOPMENT
    // const socketInstance = io('http://localhost:3001');

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
      <LeftPanel socket={socket} />
      <MainContent socket={socket} roomInfo={roomInfo} />
      <RightPanel socket={socket} roomInfo={roomInfo} isConfirmed={isConfirmed} />
    </div>
  );
}

export default App;
