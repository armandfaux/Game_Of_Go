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
    boardSize: number;
    board: number[][]; // 0 = empty, 1 = black, 2 = white
    currentPlayer: number;
    prisoners: number[];
    moveHistory: Move[];
    passCount: number;
    state: 'waiting' | 'playing' | 'finished';
    createdAt: Date;
    koInfo: {
        position: Position | null;
        restrictedPlayer: number | null;
    };
    zobristHash: bigint;
    previousHashes: Set<bigint>;
}

// interface GroupGraph {
//   stones: Position[];      // All stones in the group
//   liberties: Position[];   // Current liberties
//   children: GroupGraph[];  // Possible future states after moves
// }