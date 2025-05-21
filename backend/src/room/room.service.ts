import { Injectable } from '@nestjs/common';

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
    players: string[]; // Socket IDs or user IDs
    boardSize: number;
    board: number[][]; // 0 = empty, 1 = black, 2 = white
    currentPlayer: 'black' | 'white';
    prisoners: { black: number; white: number };
    moveHistory: Move[];
    state: GameState;
    createdAt: Date;
    // koPosition: Position | null;
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

    createRoom(size: number): GameRoom {
        const roomId = this.generateRoomId();
        const newRoom: GameRoom = {
            id: roomId,
            players: [],
            boardSize: size,
            board: this.initializedBoard(size),
            currentPlayer: 'black',
            prisoners: { black: 0, white: 0 },
            moveHistory: [],
            state: 'waiting',
            createdAt: new Date()
        };
        
        this.rooms.set(roomId, newRoom);
        // this.displayRooms();
        return newRoom;
    }

    getRoom(roomId: string): GameRoom | undefined {
        return this.rooms.get(roomId);
    }

    addPlayerToRoom(roomId: string, playerId: string): boolean {
        const room = this.getRoom(roomId);
        if (room && !room.players.includes(playerId) && room.players.length < room.boardSize && room.state === 'waiting') {

            // Remove player from other rooms
            this.rooms.forEach((otherRoom) => {
                if (otherRoom.players.includes(playerId)) {
                    this.removePlayerFromRoom(otherRoom.id, playerId);
                }
            });

            room.players.push(playerId);
            this.displayRooms();
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

        // for (const pos of checkedPositions) {
        //     if (room.board[pos.x][pos.y] !== (moveColor === 'black' ? 1 : 2)) {
        //         room.board[pos.x][pos.y] = 0;
        //         room.prisoners[moveColor] += 1;
        //     }
        // }
        return checkedPositions;
    }

    makeMove(roomId: string, playerId: string, position: Position): boolean {
        const room = this.getRoom(roomId);
        if (!room || room.state !== 'playing') return false;

        const playerIndex = room.players.indexOf(playerId);
        if (playerIndex === -1) return false;

        // Verify it's the player's turn
        const expectedColor = playerIndex === 0 ? 'black' : 'white';
        if (room.currentPlayer !== expectedColor) return false;

        // Check if the move is legal
        if (!this.isLegalMove(room, position)) return false;
    
        // Execute move
        const stoneValue = expectedColor === 'black' ? 1 : 2;
        room.board[position.x][position.y] = stoneValue;

        for (const dir of this.directions) {
            const newX = position.x + dir.x;
            const newY = position.y + dir.y;

            if (newX >= 0 && newX < room.boardSize && newY >= 0 && newY < room.boardSize) {
                const adjacentPosition: Position = { x: newX, y: newY };
                const checkedPositions = this.checkCaptures(room, adjacentPosition, expectedColor, [position]);

                if (!checkedPositions.some(pos => room.board[pos.x][pos.y] === 0)) {
                    for (const pos of checkedPositions) {
                        if (room.board[pos.x][pos.y] !== stoneValue) {
                            room.board[pos.x][pos.y] = 0;
                            room.prisoners[expectedColor === 'black' ? 'white' : 'black'] += 1;
                        }
                    }
                }
            }
        }

        // Update game state
        room.moveHistory.push({
            playerId: playerId,
            position: position,
            color: expectedColor
        });
        room.currentPlayer = expectedColor === 'black' ? 'white' : 'black';

        this.displayRoomInfo(roomId);

        return true;
    }

    displayRooms(): void {
        console.log('Current Rooms:');
        this.rooms.forEach((room) => {
            console.log(`Room ID: ${room.id}, Players: ${room.players.length}/${room.boardSize}, State: ${room.state}`);
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
