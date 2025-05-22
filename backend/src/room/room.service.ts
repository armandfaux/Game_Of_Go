import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

type GameState = 'waiting' | 'playing' | 'finished';

export interface Position {
    x: number;
    y: number;
  }

interface Move {
    playerId: string;
    position: Position;
    color: 'black' | 'white';
}

interface GameRoom {
    id: string;
    roomSize: number;
    players: string[];
    boardSize: number;
    board: number[][]; // 0 = empty, 1 = black, 2 = white
    currentPlayer: 'black' | 'white';
    prisoners: { black: number; white: number };
    moveHistory: Move[];
    state: GameState;
    createdAt: Date;
    koInfo: {
        position: Position | null;
        restrictedPlayer: 'black' | 'white' | null;
    };
    zobristHash: bigint;
    previousHashes: Set<bigint>;
}

@Injectable()
export class RoomService {
    private rooms: Map<string, GameRoom> = new Map();
    private directions = [
        { x: -1, y: 0 }, // Up
        { x: 1, y: 0 }, // Down
        { x: 0, y: -1 }, // Left
        { x: 0, y: 1 }  // Right
    ];

    private zobristTable: { [state: number]: bigint }[][];

    constructor() {
        // Initialize with maximum expected board size (19x19)
        this.initializeZobristTable(19);
    }

    private initializeZobristTable(maxSize: number): void {
    this.zobristTable = Array(maxSize)
        .fill(null)
        .map((_, x) => 
            Array(maxSize)
            .fill(null)
            .map((_, y) => ({
                0: this.generateZobristHash(x, y, 0),
                1: this.generateZobristHash(x, y, 1),
                2: this.generateZobristHash(x, y, 2)
            }))
        );
}

    private generateZobristHash(x: number, y: number, state: number): bigint {
        const hash = createHash('sha256')
            .update(`x${x}y${y}s${state}`)
            .digest('hex');
        return BigInt(`0x${hash.substring(0, 16)}`);
    }

    private calculateBoardHash(room: GameRoom): bigint {
        let hash = 0n;
        for (let x = 0; x < room.boardSize; x++) {
            for (let y = 0; y < room.boardSize; y++) {
                hash ^= this.zobristTable[x][y][room.board[x][y]];
            }
        }
        return hash;
    }

    private generateRoomId(): string {
        const length = 5;
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const charactersLength = characters.length;
        
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    createRoom(roomSize: number, boardSize: number): GameRoom {
        const roomId = this.generateRoomId();
        const board = this.initializedBoard(boardSize);
        
        const newRoom: GameRoom = {
            id: roomId,
            roomSize: roomSize,
            players: [],
            boardSize: boardSize,
            board: board,
            currentPlayer: 'black',
            prisoners: { black: 0, white: 0 },
            moveHistory: [],
            state: 'waiting',
            createdAt: new Date(),
            koInfo: {
                position: null,
                restrictedPlayer: null
            },
            zobristHash: this.calculateBoardHash({ 
                boardSize, 
                board,
                // Other required fields with dummy values
                id: '',
                roomSize: 0,
                players: [],
                currentPlayer: 'black',
                prisoners: { black: 0, white: 0 },
                moveHistory: [],
                state: 'waiting',
                createdAt: new Date(),
                koInfo: { position: null, restrictedPlayer: null },
                previousHashes: new Set(),
                zobristHash: 0n
            }),
            previousHashes: new Set()
        };

        // Initialize with empty board hash
        newRoom.previousHashes.add(newRoom.zobristHash);
        this.rooms.set(roomId, newRoom);
        return newRoom;
    }

    getRoom(roomId: string): GameRoom | undefined {
        return this.rooms.get(roomId);
    }

    addPlayerToRoom(roomId: string, playerId: string): boolean {
        const room = this.getRoom(roomId);
        if (room && !room.players.includes(playerId) && room.players.length < room.roomSize && room.state === 'waiting') {

            // Remove player from other rooms
            this.rooms.forEach((otherRoom) => {
                if (otherRoom.players.includes(playerId)) {
                    this.removePlayerFromRoom(otherRoom.id, playerId);
                }
            });

            room.players.push(playerId);
            return true;
        }
        return false;
    }

    removePlayerFromRoom(roomId: string, playerId: string): boolean {
        const room = this.getRoom(roomId);
        if (room) {
            const index = room.players.indexOf(playerId);
            if (index !== -1) {
                room.players.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    private initializedBoard(size: number): number[][] {
        return Array(size).fill(0).map(() => Array(size).fill(0));
    }

    startGame(roomId: string): boolean {
        const room = this.getRoom(roomId);
        if (room && room.state === 'waiting' && room.players.length > 1 ) {
            console.log('Starting game in room:', roomId);
            room.state = 'playing';
            room.board = this.initializedBoard(room.boardSize);
            return true;
        }
        return false;
    }

    positionHasLiberty(room: GameRoom, position: Position, color: 'black' | 'white', checkedPositions: Position[]): boolean {
        checkedPositions.push(position);

        // Try adjacent valid positions
        for (const dir of this.directions) {
            const newX = position.x + dir.x;
            const newY = position.y + dir.y;

            if (newX >= 0 && newX < room.boardSize && newY >= 0 && newY < room.boardSize &&
                // Avoid checking the same position again
                !checkedPositions.some(pos => pos.x === newX && pos.y === newY))
            {
                if (room.board[newX][newY] === 0) return true;
                if (room.board[newX][newY] === (color === 'black' ? 1 : 2)) {
                    // Check if the adjacent stone has liberties
                    const adjacentPosition: Position = { x: newX, y: newY };
                    if (this.positionHasLiberty(room, adjacentPosition, color, checkedPositions)) return true;
                }
            }
        }
        return false; // No liberties found
    }

    isLegalMove(room: GameRoom, position: Position): boolean {
        if (room.board[position.x][position.y] !== 0) return false;

        // Out of bounds check
        if (position.x < 0 || position.x >= room.boardSize || position.y < 0 || position.y >= room.boardSize) return false;

        if (!this.positionHasLiberty(room, position, room.currentPlayer, [])) {
            // check if the move captures, then it's legal

            for (const dir of this.directions) {
                const newX = position.x + dir.x;
                const newY = position.y + dir.y;

                if (newX >= 0 && newX < room.boardSize && newY >= 0 && newY < room.boardSize) {
                    if (!this.positionHasLiberty(room, {x: newX, y: newY}, room.currentPlayer == 'white' ? 'black' : 'white', [position])) {
                        return true;
                    }
                }
            }

            return false;
        }

        return true;
    }

    checkCaptures(room: GameRoom, position: Position, moveColor: 'black' | 'white', checkedPositions: Position[]): Position[] {
        checkedPositions.push(position);

        // Try adjacent valid positions
        for (const dir of this.directions) {
            const newX = position.x + dir.x;
            const newY = position.y + dir.y;

            if (newX >= 0 && newX < room.boardSize && newY >= 0 && newY < room.boardSize &&
                !checkedPositions.some(pos => pos.x === newX && pos.y === newY))
            {
                const adjacentPosition: Position = { x: newX, y: newY };
                checkedPositions.push(adjacentPosition);
                if (room.board[newX][newY] === (moveColor === 'black' ? 2 : 1)) {
                    // Check if the adjacent stone has liberties
                    this.checkCaptures(room, adjacentPosition, moveColor, checkedPositions);
                }
            }
        }

        return checkedPositions;
    }

    makeMove(roomId: string, playerId: string, position: Position): boolean {
        // Error handling
        const room = this.getRoom(roomId);
        if (!room || room.state !== 'playing') return false;

        const playerIndex = room.players.indexOf(playerId);
        if (playerIndex === -1) return false;

        const moveColor = playerIndex === 0 ? 'black' : 'white';
        if (room.currentPlayer !== moveColor) return false;

        // Check basic KO rule
        if (room.koInfo.position && 
            room.koInfo.position.x === position.x && 
            room.koInfo.position.y === position.y && 
            room.koInfo.restrictedPlayer === moveColor) {
            return false;
        }

        if (!this.isLegalMove(room, position)) return false;

        // Clone current board for simulation
        const newBoard = room.board.map(row => [...row]);
        const stoneValue = moveColor === 'black' ? 1 : 2;
        newBoard[position.x][position.y] = stoneValue;

        // Process captures
        let capturedStones: Position[] = [];
        for (const dir of this.directions) {
            const newX = position.x + dir.x;
            const newY = position.y + dir.y;

            if (newX >= 0 && newX < room.boardSize && newY >= 0 && newY < room.boardSize) {
                const adjacentPosition: Position = { x: newX, y: newY };
                const checkedPositions = this.checkCaptures(
                    { ...room, board: newBoard }, 
                    adjacentPosition, 
                    moveColor, 
                    [position]
                );

                if (!checkedPositions.some(pos => newBoard[pos.x][pos.y] === 0)) {
                    for (const pos of checkedPositions) {
                        if (newBoard[pos.x][pos.y] !== stoneValue) {
                            newBoard[pos.x][pos.y] = 0;
                            capturedStones.push(pos);
                        }
                    }
                }
            }
        }

        // Calculate new hash
        let newHash = room.zobristHash;
        newHash ^= this.zobristTable[position.x][position.y][0]; // Remove empty
        newHash ^= this.zobristTable[position.x][position.y][stoneValue]; // Add stone
        
        // Update hash for captured stones
        for (const pos of capturedStones) {
            const capturedValue = moveColor === 'black' ? 2 : 1;
            newHash ^= this.zobristTable[pos.x][pos.y][capturedValue]; // Remove captured
            newHash ^= this.zobristTable[pos.x][pos.y][0]; // Add empty
        }

        // Check superko (positional repetition)
        if (room.previousHashes.has(newHash)) {
            return false;
        }

        // Update game state
        room.board = newBoard;
        room.prisoners[moveColor === 'black' ? 'white' : 'black'] += capturedStones.length;
        room.moveHistory.push({
            playerId: playerId,
            position: position,
            color: moveColor
        });
        room.currentPlayer = moveColor === 'black' ? 'white' : 'black';
        
        // Update KO info
        room.koInfo = capturedStones.length === 1 ? {
            position: capturedStones[0],
            restrictedPlayer: moveColor
        } : {
            position: null,
            restrictedPlayer: null
        };

        // Update hashes
        room.previousHashes.add(newHash);
        room.zobristHash = newHash;

        return true;
    }

    displayRooms(): void {
        console.log('Current Rooms:');
        this.rooms.forEach((room) => {
            console.log(`Room ID: ${room.id}, Players: ${room.players.length}/${room.roomSize}, State: ${room.state}`);
        });
    }

    displayRoomInfo(roomId: string): void {
        const room = this.getRoom(roomId);
        if (room) {
            console.log('---------------------------------------------------------');
            console.log(`Room ID:           ${room.id}`);
            console.log(`Players:           ${room.players.join(', ')}`);
            console.log(`Board Size:        ${room.boardSize}`);
            console.log(`Current Player:    ${room.currentPlayer}`);
            console.log(`State:             ${room.state}`);
            console.log(`Moves played:      ${room.moveHistory.length}`);
            console.log('---------------------------------------------------------');
        } else {
            console.log(`Room with ID ${roomId} not found.`);
        }
    }
}
