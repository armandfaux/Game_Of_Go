import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import styles from '../styles/CreateGame.module.css';

interface CreateGameProps {
  socket: Socket | null;
}

const CreateGame: React.FC<CreateGameProps> = ({ socket }) => {
  const defaultBoardSize = 13;
  const [boardSize, setBoardSize] = useState<number>(defaultBoardSize);
  const [roomSize, setRoomSize] = useState<number>(2);

  const handleCreateRoom = () => {
    if (socket) {
      socket.emit('createRoom', { roomSize, boardSize });
    } else {
      console.warn('Socket not connected');
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Create New Game</h3>
      
      <div className={styles.formGroup}>
        <label htmlFor="board-size" className={styles.label}>
          Board Size
        </label>
        <select
          id="board-size"
          onChange={(e) => setBoardSize(Number(e.target.value))}
          className={styles.select}
          defaultValue={defaultBoardSize}
        >
          <option value={5}>5×5 (First steps)</option>
          <option value={9}>9×9 (Small)</option>
          <option value={13}>13×13 (Medium)</option>
          <option value={19}>19×19 (Official)</option>
          <option value={24}>24×24 (Huge)</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="room-size" className={styles.label}>
          Number of Players
        </label>
        <select
          id="room-size"
          value={roomSize}
          onChange={(e) => setRoomSize(Number(e.target.value))}
          className={styles.select}
        >
          <option value={2}>2 Players</option>
          <option value={3}>3 Players</option>
          <option value={4}>4 Players</option>
        </select>
      </div>

      <button
        onClick={handleCreateRoom}
        className={styles.button}
      >
        Create Game Room
      </button>
    </div>
  );
};

export default CreateGame;