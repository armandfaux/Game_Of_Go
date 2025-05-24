import { Injectable } from '@nestjs/common';
import { GameService } from 'src/game/game.service';
import { GameRoom, Position } from 'src/interface/game.interface';

@Injectable()
export class RoomService {
    private readonly rooms = new Map<string, GameRoom>();

    // construct game service
    constructor(private readonly gameService: GameService) {}

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
            currentPlayer: 1,
            prisoners: new Array(roomSize).fill(0),
            moveHistory: [],
            state: 'waiting',
            createdAt: new Date(),
            koInfo: { position: null, restrictedPlayer: null },
            zobristHash: this.gameService.calculateInitialHash(boardSize),
            previousHashes: new Set()
        };

        newRoom.previousHashes.add(newRoom.zobristHash);
        this.rooms.set(roomId, newRoom);
        return newRoom;
    }

    addPlayerToRoom(roomId: string, playerId: string): boolean {
        const room = this.rooms.get(roomId);
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
        const room = this.rooms.get(roomId);
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
        const room = this.rooms.get(roomId);
        if (room && room.state === 'waiting' && room.players.length === room.roomSize) {
            room.state = 'playing';
            room.board = this.initializedBoard(room.boardSize);
            return true;
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
        const room = this.rooms.get(roomId);
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
