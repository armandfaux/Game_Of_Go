import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface Room {
    id: string;
    players: string[];
    size: number;
    status: 'waiting' | 'playing';
}

interface RoomLobbyProps {
    socket: Socket;
    currentPlayer: string;
    onGameStart: (roomId: string) => void;
}

const RoomLobby: React.FC<RoomLobbyProps> = ({ currentPlayer, onGameStart }) => {

    const startGame = (roomId: string) => {
        console.log('Starting game in room:', roomId);
        // socket.emit('startGame', roomId); // Emit the event to start the game
    }

    return (
        <div className="room-lobby">
            <h2>Room Lobby</h2>
            <p>Current Player: {currentPlayer}</p>
            <button onClick={() => onGameStart('roomId')}>Start Game</button>
        </div>
    )
}

export default RoomLobby;