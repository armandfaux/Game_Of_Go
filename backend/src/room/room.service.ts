import { Injectable, OnModuleInit } from '@nestjs/common';
import { GameService } from 'src/game/game.service';
import { GameRoom, Position } from 'src/interface/game.interface';
import { setInterval } from 'timers/promises';

@Injectable()
export class RoomService implements OnModuleInit {
    private readonly rooms = new Map<string, GameRoom>();
    private readonly ROOM_TTL_MS = 1000 * 3600 * 24;

    constructor(private gameService: GameService) {}

    async onModuleInit() {
        this.startCleanupJob();
    }

    private async startCleanupJob() {
        const intervalMs = 1000 * 3600 * 12;

        for await (const _ of setInterval(intervalMs)) {
            await this.cleanupOldRooms();
        }
    }

    private async cleanupOldRooms() {
        const now = Date.now();
        const rooms = this.rooms;

        rooms.forEach((room, roomId) => {
            const roomAge = now - room.createdAt.getTime();
            if (roomAge > this.ROOM_TTL_MS) {
                this.rooms.delete(roomId);
                console.log(`Deleting stale room ${roomId}`);
            }
        });
        this.displayRooms();
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
            currentPlayer: 1,
            state: 'waiting',
            boardSize,
            board,
            prisoners: new Array(roomSize).fill(0),
            passCount: 0,
            moveHistory: [],
            markedStones: Array.from({ length: roomSize }, () => [] as Position[]),
            koInfo: { position: null, restrictedPlayer: null },
            zobristHash: this.gameService.calculateInitialHash(boardSize),
            previousHashes: new Set(),
            createdAt: new Date(),
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
        console.log(`[INFO] Current Rooms (${this.rooms.size}):`);
        console.log('---------------------------------------------------------');
        this.rooms.forEach((room) => {
            console.log(`Room ID: ${room.id}, Players: ${room.players.length}/${room.roomSize}, State: ${room.state}`);
        });
        console.log('---------------------------------------------------------');
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
