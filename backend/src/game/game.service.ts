import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { GameRoom, Position } from 'src/interface/game.interface';
import { Logger } from '@nestjs/common';

// DESCRIPTION:
// The GameService is responsible for managing the game logic,
// including move validation, making moves, and handling game state.

@Injectable()
export class GameService {
    logger = new Logger(GameService.name);

    private readonly directions = [
        { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }
    ];

    afterInit() {
        console.log('GameService initialized');
    };

    public minPlayers = 2;
    public maxPlayers = 4;

    public minBoardSize = 5;
    public maxBoardSize = 24;

    constructor() {
        this.initializeZobristTable(this.maxBoardSize);
    }

    isValidMove(room: GameRoom, playerId: string, position: Position): boolean {
        if (room.gameState !== 'playing') return false;

        // Check if the player is in the room
        const playerIndex = room.players.indexOf(playerId);
        if (playerIndex === -1) return false;

        // Check if it's the player's turn
        if (room.currentPlayer !== playerIndex + 1) return false;

        // Check bounds and if the position is empty
        if (position.x < 0 || position.x >= room.boardSize || 
            position.y < 0 || position.y >= room.boardSize || 
            room.board[position.x][position.y] !== 0) {
            return false;
        }

        // Check KO rule
        if (room.koPosition && 
            room.koPosition.x === position.x && 
            room.koPosition.y === position.y && 
            room.restrictedPlayer === room.currentPlayer) {
            return false;
        }

        return true;
    }

    makeMove(room: GameRoom, playerId: string, position: Position): boolean {
        if (!room) return false;
        if (!this.isValidMove(room, playerId, position)) return false;

        // Clone board and prepare move
        const newBoard = room.board.map(row => [...row]);
        const moveColor = room.currentPlayer;
        // const stoneValue = (moveColor === 'black' ? 1 : 2);
        newBoard[position.x][position.y] = moveColor;

        // Process captures
        const capturedStones = this.processCaptures(room, newBoard, position);

        if (capturedStones.length == 0) {
            const group = this.findGroup(newBoard, position);
            if(!group.some(pos => this.hasLiberty(newBoard, pos))) {
                return false;
            }
        }

        // Calculate new hash
        let newHash = room.zobristHash;
        newHash ^= this.zobristTable[position.x][position.y][0];
        newHash ^= this.zobristTable[position.x][position.y][moveColor];

        for (const pos of capturedStones) {
            const capturedValue = newBoard[pos.x][pos.y];
            newHash ^= this.zobristTable[pos.x][pos.y][capturedValue];
            newHash ^= this.zobristTable[pos.x][pos.y][0];
        }

        // Check superko
        if (room.previousHashes.has(newHash)) return false;

        // Update game state
        room.board = newBoard;
        room.prisoners[moveColor - 1] += capturedStones.length;
        room.currentPlayer = (moveColor % room.players.length) + 1;
        room.passCount = 0;

        // Update KO info
        room.koPosition = capturedStones.length === 1
            ? capturedStones[0]
            : null;

        room.restrictedPlayer = capturedStones.length === 1
            ? room.currentPlayer
            : null;

        // Update hashes
        room.previousHashes.add(newHash);
        room.zobristHash = newHash;

        return true;
    }

    private processCaptures(room: GameRoom, board: number[][], position: Position): Position[] {
        const capturedStones: Position[] = [];

        for (const dir of this.directions) {
            const x = position.x + dir.x;
            const y = position.y + dir.y;

            if (x >= 0 && x < room.boardSize && y >= 0 && y < room.boardSize &&
                board[x][y] !== room.currentPlayer && board[x][y] !== 0
            ) {
                const group = this.findGroup(board, {x, y});
                if (!group.some(pos => this.hasLiberty(board, pos))) {
                    for (const pos of group) {
                        board[pos.x][pos.y] = 0;
                        capturedStones.push(pos);
                    }
                }
            }
        }
        return capturedStones;
    }

    // Return the chain starting from the given position
    private findGroup(board: number[][], start: Position): Position[] {
        const color = board[start.x][start.y];
        const group: Position[] = [];
        const visited: Position[] = [];
        const stack = [start];

        while (stack.length > 0) {
            const current = stack.pop()!;

            if (visited.some(pos => pos.x === current.x && pos.y === current.y)) continue;

            visited.push(current);
            group.push(current);

            for (const dir of this.directions) {
                const x = current.x + dir.x;
                const y = current.y + dir.y;

                if (
                    // Check bounds
                    x >= 0 && x < board.length && y >= 0 && y < board[x].length &&

                    // Check same color
                    board[x][y] === color &&

                    // Check not visited
                    !visited.some(pos => pos.x === x && pos.y === y)
                ) {
                    stack.push({x, y});
                }
            }
        }

        return group;
    }

    private hasLiberty(board: number[][], position: Position): boolean {
        for (const dir of this.directions) {
            const x = position.x + dir.x;
            const y = position.y + dir.y;

            if (x >= 0 && x < board.length && y >= 0 && y < board[x].length && board[x][y] === 0) {
                return true;
            }
        }
        return false;
    }

    passTurn(room: GameRoom, playerId: string): boolean {
        if (!room || room.gameState !== 'playing') return false;

        const playerIndex = room.players.indexOf(playerId);
        if (playerIndex === -1 || room.currentPlayer !== playerIndex + 1) return false;

        room.koPosition = null;
        room.restrictedPlayer = null;
        room.currentPlayer = (room.currentPlayer % room.players.length) + 1;

        if (++room.passCount >= room.roomSize) {
            room.gameState = 'scoring';
        }

        return true;
    }

    resign(room: GameRoom, playerId: string): boolean {
        // Check if the room exists and is playing
        if (!room || room.gameState !== 'playing') return false;

        // Check if the player is in the room
        const playerIndex = room.players.indexOf(playerId);
        if (playerIndex === -1) return false;

        this.finishGame(room);

        return true;
    }

    // -------------------------------------------
    // ----------- End of game system ------------
    // -------------------------------------------
    finishGame(room: GameRoom): void {
        if (!room) return;

        console.log(`[EVENT] Game ${room.id} finished`);
        room.gameState = 'finished';
        this.removeDeadStones(room);
        this.getTerritoryScores(room.board, room.roomSize).map((territory, index) => {
            // scores[0] is neutral territory (dame)
            // following values are player scores (added to prisoners)
            room.territoryScores[index] = territory;
        });
    }

    markGroup(room: GameRoom, playerId: string, start: Position): boolean {
        if (!room || room.gameState !== 'scoring') return false;
        if (room.board[start.x][start.y] === 0) return false;

        const playerIndex = room.players.indexOf(playerId);
        if (playerIndex === -1) return false;

        const positions = this.findGroup(room.board, start);
        if (room.markedStones[playerIndex].some(pos => start.x === pos.x && start.y === pos.y)) {
            // unmark if already marked
            room.markedStones[playerIndex] = room.markedStones[playerIndex].filter(pos => !positions.some(p => p.x === pos.x && p.y === pos.y));
        } else {
            // mark the group
            room.markedStones[playerIndex] = room.markedStones[playerIndex].concat(positions);
        }

        room.playersConfirmed = [];
        return true;
    }

    // Return true if all players have marked the same stones as "dead", false otherwise
    checkMarkedStones(stones: Position[][]): boolean {
        const signature = JSON.stringify(stones[0].slice().sort((a, b) => a.x - b.x || a.y - b.y));

        return stones.every(subArray => {
            const currentSignature = JSON.stringify(
                subArray.slice().sort((a, b) => a.x - b.x || a.y - b.y)
            );
            return currentSignature === signature;
        });
    }

    // Return true if the player can confirm or cancel, false otherwise
    confirmMarking(room: GameRoom, playerId: string): boolean {
        if (!room || room.gameState !== 'scoring') return false;

        if (!room.players.includes(playerId)) return false;

        if (room.playersConfirmed.includes(playerId)) {
            room.playersConfirmed = room.playersConfirmed.filter(id => id !== playerId);
            return true;
        }

        if (this.checkMarkedStones(room.markedStones)) {

            room.playersConfirmed.push(playerId);

            // Check if all players have confirmed
            if (room.playersConfirmed.length >= room.players.length) {
                this.finishGame(room);
            }
            return true;
        }
        return false;
    }

    removeDeadStones(room: GameRoom): void {
        if (!room) return;

        room.markedStones[0].forEach(pos => {
            room.board[pos.x][pos.y] = 0; // Remove the stone from the board

            const group = this.findGroup(room.board, pos);
            const territoryColor = this.findTerritoryColor(room.board, group, room.markedStones[0]);

            if (territoryColor > 0) {
                room.prisoners[territoryColor - 1] += 1;
            }
        });
    }

    getTerritoryScores(board: number[][], roomSize: number): number[] {
        const territoryScore = new Array(roomSize + 1).fill(0);
        const visited: Position[] = [];
        const emptyPositions = this.findEmptyPositions(board);

        for (const pos of emptyPositions) {
            if (visited.some(v => v.x === pos.x && v.y === pos.y)) continue;

            const group = this.findGroup(board, pos);

            const territoryColor = this.findTerritoryColor(board, group, []);
            territoryScore[territoryColor] += group.length;

            group.map(p => visited.push(p));
        }

        return territoryScore;
    }

    findEmptyPositions(board: number[][]): Position[] {
        return board.flatMap((row, x) =>
            row.map((cell, y) => (cell === 0 ? { x, y } : null))
            .filter((pos): pos is Position => pos !== null)
        );
    }

    // Return index of the player owning this territory, ignore Position in deadStones[]
    findTerritoryColor(board: number[][], group: Position[], deadStones: Position[]): number {
        var territoryColor = 0;

        for (const pos of group) {
            for (const dir of this.directions) {
                const newX = pos.x + dir.x;
                const newY = pos.y + dir.y;

                if (newX < 0 || newX >= board.length || newY < 0 || newY >= board[newX].length) continue;
                if (deadStones.some(p => p.x === newX && p.y === newY)) continue;

                if (board[newX][newY] > 0) {
                    if (territoryColor === 0) {
                        territoryColor = board[newX][newY];
                    }

                    if (board[newX][newY] !== territoryColor) {
                        return 0;
                    }
                }
            }
        }

        return territoryColor;
    }

    // -------------------------------------------
    // -- Zobrist hashing for superko detection --
    // -------------------------------------------
    private zobristTable: { [state: number]: bigint }[][];

    private initializeZobristTable(maxSize: number): void {
        this.zobristTable = new Array(maxSize);
        for (let x = 0; x < maxSize; x++) {
            this.zobristTable[x] = new Array(maxSize);
            for (let y = 0; y < maxSize; y++) {
                this.zobristTable[x][y] = {
                    0: this.generateZobristHash(x, y, 0),
                    1: this.generateZobristHash(x, y, 1),
                    2: this.generateZobristHash(x, y, 2),
                    3: this.generateZobristHash(x, y, 3),
                    4: this.generateZobristHash(x, y, 4),
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

    public calculateInitialHash(boardSize: number): bigint {
        let hash = 0n;
        for (let x = 0; x < boardSize; x++) {
            for (let y = 0; y < boardSize; y++) {
                hash ^= this.zobristTable[x][y][0];
            }
        }
        return hash;
    }
    // -------------------------------------------
}
