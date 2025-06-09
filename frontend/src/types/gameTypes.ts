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

export type RoomInfo = {
    id: string,
    roomSize: number,
    players: string[],
    currentPlayer: number,

    boardSize: number,
    board: number[][],
    prisoners: number[],
    koPosition: { x: number, y: number } | null,

    playersConfirmed: string[],
    scores: number[],

    gameState: string,
}

//   const [socket, setSocket] = useState<Socket | null>(null);

//   const [gobanLabel, setGobanLabel] = useState<string>('Goban');
//   const [isConfirmed, setIsConfirmed] = useState(false);
//   const [scores, setScores] = useState<number[]>([]);
