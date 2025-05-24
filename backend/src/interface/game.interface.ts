export interface Position {
    x: number;
    y: number;
  }

export interface Move {
    playerId: string;
    position: Position;
    color: number;
}

export interface Player {
    id: string;
    color: number;
}

export interface GameRoom {
    id: string;
    roomSize: number;
    players: string[];
    boardSize: number;
    board: number[][]; // 0 = empty, 1 = black, 2 = white
    currentPlayer: number;
    prisoners: number[];
    moveHistory: Move[];
    state: 'waiting' | 'playing' | 'finished';
    createdAt: Date;
    koInfo: {
        position: Position | null;
        restrictedPlayer: number | null;
    };
    zobristHash: bigint;
    previousHashes: Set<bigint>;
}