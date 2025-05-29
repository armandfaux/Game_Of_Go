export type Stone = 'empty' | 'black' | 'white' | 'green' | 'purple';

export type Player = {
    id: string,
    name: string,
    color: string,
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

    gameState: string,
}