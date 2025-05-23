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
    private readonly rooms = new Map<string, GameRoom>();
    private readonly directions = [
        { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }
    ];
    private zobristTable: { [state: number]: bigint }[][];

    constructor() {
        this.initializeZobristTable(19);
    }

    private initializeZobristTable(maxSize: number): void {
        this.zobristTable = new Array(maxSize);
        for (let x = 0; x < maxSize; x++) {
            this.zobristTable[x] = new Array(maxSize);
            for (let y = 0; y < maxSize; y++) {
                this.zobristTable[x][y] = {
                    0: this.generateZobristHash(x, y, 0),
                    1: this.generateZobristHash(x, y, 1),
                    2: this.generateZobristHash(x, y, 2)
                };
            }
        }
    }

    private generateZobristHash(x: number, y: number, state: number): bigint {
        const hash = createHash('sha256')
            .update(`x${x}y${y}s${state}`)
            .digest('hex');
        return BigInt(`0x${hash.substring(0, 16)}`);
    }

    private calculateInitialHash(boardSize: number): bigint {
        let hash = 0n;
        for (let x = 0; x < boardSize; x++) {
            for (let y = 0; y < boardSize; y++) {
                hash ^= this.zobristTable[x][y][0];
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
        const board = Array(boardSize).fill(null).map(() => new Array(boardSize).fill(0));
        
        const newRoom: GameRoom = {
            id: roomId,
            roomSize,
            players: [],
            boardSize,
            board,
            currentPlayer: 'black',
            prisoners: { black: 0, white: 0 },
            moveHistory: [],
            state: 'waiting',
            createdAt: new Date(),
            koInfo: { position: null, restrictedPlayer: null },
            zobristHash: this.calculateInitialHash(boardSize),
            previousHashes: new Set()
        };

        newRoom.previousHashes.add(newRoom.zobristHash);
        this.rooms.set(roomId, newRoom);
        return newRoom;
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

    // Optimized move validation
    isLegalMove(room: GameRoom, position: Position): boolean {
        // Early exits for invalid positions
        if (position.x < 0 || position.x >= room.boardSize || 
            position.y < 0 || position.y >= room.boardSize || 
            room.board[position.x][position.y] !== 0) {
            return false;
        }

        const hasLiberty = this.positionHasLiberty(room, position, room.currentPlayer, []);
        if (hasLiberty) return true;

        // Only check captures if no immediate liberty
        return this.checkPotentialCaptures(room, position);
    }

    private checkPotentialCaptures(room: GameRoom, position: Position): boolean {
        const opponent = room.currentPlayer === 'black' ? 2 : 1;
        
        for (const dir of this.directions) {
            const x = position.x + dir.x;
            const y = position.y + dir.y;
            
            if (x >= 0 && x < room.boardSize && y >= 0 && y < room.boardSize && 
                room.board[x][y] === opponent && 
                !this.positionHasLiberty(room, {x, y}, room.currentPlayer === 'black' ? 'white' : 'black', [position])) {
                return true;
            }
        }
        return false;
    }

    makeMove(roomId: string, playerId: string, position: Position): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.state !== 'playing') return false;

        const playerIndex = room.players.indexOf(playerId);
        if (playerIndex === -1) return false;

        const moveColor = playerIndex === 0 ? 'black' : 'white';
        if (room.currentPlayer !== moveColor) return false;

        // Check basic KO rule
        const { koInfo } = room;
        if (koInfo.position?.x === position.x && 
            koInfo.position?.y === position.y && 
            koInfo.restrictedPlayer === moveColor) {
            return false;
        }

        if (!this.isLegalMove(room, position)) return false;

        // Clone board and prepare move
        const newBoard = room.board.map(row => [...row]);
        const stoneValue = moveColor === 'black' ? 1 : 2;
        newBoard[position.x][position.y] = stoneValue;

        // Process captures
        const capturedStones = this.processCaptures(room, newBoard, position, moveColor);

        // Calculate new hash
        let newHash = room.zobristHash;
        newHash ^= this.zobristTable[position.x][position.y][0];
        newHash ^= this.zobristTable[position.x][position.y][stoneValue];

        for (const pos of capturedStones) {
            const capturedValue = moveColor === 'black' ? 2 : 1;
            newHash ^= this.zobristTable[pos.x][pos.y][capturedValue];
            newHash ^= this.zobristTable[pos.x][pos.y][0];
        }

        // Check superko
        if (room.previousHashes.has(newHash)) return false;

        // Update game state
        room.board = newBoard;
        room.prisoners[moveColor] += capturedStones.length;
        room.moveHistory.push({ playerId, position, color: moveColor });
        room.currentPlayer = moveColor === 'black' ? 'white' : 'black';
        
        // Update KO info
        room.koInfo = capturedStones.length === 1 
            ? { position: capturedStones[0], restrictedPlayer: moveColor }
            : { position: null, restrictedPlayer: null };

        // Update hashes
        room.previousHashes.add(newHash);
        room.zobristHash = newHash;

        return true;
    }

    private processCaptures(room: GameRoom, board: number[][], position: Position, moveColor: 'black' | 'white'): Position[] {
        const capturedStones: Position[] = [];
        const opponent = moveColor === 'black' ? 2 : 1;

        for (const dir of this.directions) {
            const x = position.x + dir.x;
            const y = position.y + dir.y;
            
            if (x >= 0 && x < room.boardSize && y >= 0 && y < room.boardSize && board[x][y] === opponent) {
                const group = this.findGroup(board, {x, y}, opponent, room.boardSize);
                if (!group.some(pos => this.hasLiberty(board, pos, room.boardSize))) {
                    for (const pos of group) {
                        board[pos.x][pos.y] = 0;
                        capturedStones.push(pos);
                    }
                }
            }
        }
        return capturedStones;
    }

    private findGroup(board: number[][], start: Position, color: number, boardSize: number): Position[] {
        const group: Position[] = [];
        const visited = new Set<string>();
        const stack = [start];
        
        while (stack.length > 0) {
            const current = stack.pop()!;
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            group.push(current);
            
            for (const dir of this.directions) {
                const x = current.x + dir.x;
                const y = current.y + dir.y;
                
                if (x >= 0 && x < boardSize && y >= 0 && y < boardSize && 
                    board[x][y] === color && 
                    !visited.has(`${x},${y}`)) {
                    stack.push({x, y});
                }
            }
        }
        return group;
    }

    private hasLiberty(board: number[][], position: Position, boardSize: number): boolean {
        for (const dir of this.directions) {
            const x = position.x + dir.x;
            const y = position.y + dir.y;
            
            if (x >= 0 && x < boardSize && y >= 0 && y < boardSize && board[x][y] === 0) {
                return true;
            }
        }
        return false;
    }

    getRoom(roomId: string): GameRoom | undefined {
        return this.rooms.get(roomId);
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
