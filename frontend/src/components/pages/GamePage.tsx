import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomInfoObj } from '../../types/gameTypes';

import CreateGameBtn from '../buttons/CreateGameBtn';
import JoinGameBtn from '../buttons/JoinGameBtn';
import Goban from '../Goban';
import RoomInfoBox from '../RoomInfoBox';
import StartGameBtn from '../buttons/StartGameBtn';
import PassTurnBtn from '../buttons/PassTurnBtn';
import ResignBtn from '../buttons/ResignBtn';
import ConfirmMarkingBtn from '../buttons/ConfirmMarkingBtn';
import GameOverBox from '../GameOverBox';

import '../../styles/GamePage.css';

function GamePage() {
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
    <div className='grille'>
      <aside  className='left-panel'>
        { socket && (
          <div>
                <CreateGameBtn socket={socket} />
                <JoinGameBtn socket={socket} />
            </div>
        )}
      </aside>

      <main className='main-content'>
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
          <RoomInfoBox
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
        <div style={{ marginTop: '20px' }}>
          <GameOverBox roomInfo={roomInfo}/>
        </div>
      )}
      </aside>
      
    </div>
  );
}

export default GamePage;