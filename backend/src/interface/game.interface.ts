export interface Position {
    x: number;
    y: number;
  }

export interface Move {
    playerId: string;
    position: Position;
    color: number;
}

export interface GameRoom {
    id: string;
    roomSize: number;
    players: string[];
    currentPlayer: number;
    state: 'waiting' | 'playing' | 'scoring' | 'finished';
    boardSize: number;
    board: number[][];
    prisoners: number[];
    scores: number[];
    passCount: number;
    markedStones: Position[][];
    playersConfirmed: string[];
    koInfo: {
        position: Position | null;
        restrictedPlayer: number | null;
    };
    zobristHash: bigint;
    previousHashes: Set<bigint>;
    createdAt: Date;
}
