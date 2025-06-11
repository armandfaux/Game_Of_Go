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
    gameState: 'waiting' | 'playing' | 'scoring' | 'finished';

    boardSize: number;
    board: number[][];
    prisoners: number[];
    koPosition: Position | null;

    playersConfirmed: string[];
    territoryScores: number[];

    passCount: number;
    markedStones: Position[][];
    restrictedPlayer: number | null;
    zobristHash: bigint;
    previousHashes: Set<bigint>;
    createdAt: Date;
}
