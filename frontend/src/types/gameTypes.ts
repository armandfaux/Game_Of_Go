export type Stone = 'empty' | 'black' | 'white' | 'green' | 'purple';

// export type Player = {
//     id: string,
//     name: string,
//     color: string,
// }

export type Position = {
    x: number,
    y: number,
}

export type RoomInfoObj = {
    id: string,
    roomSize: number,
    players: string[],
    currentPlayer: number,
    gameState: 'waiting' | 'playing' | 'scoring' | 'finished',

    boardSize: number,
    board: number[][],
    prisoners: number[],
    koPosition: Position | null,

    playersConfirmed: string[],
    scores: number[],

}

//   const [socket, setSocket] = useState<Socket | null>(null);

//   const [gobanLabel, setGobanLabel] = useState<string>('Goban');
//   const [isConfirmed, setIsConfirmed] = useState(false);
//   const [scores, setScores] = useState<number[]>([]);
