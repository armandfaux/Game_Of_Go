import { Test } from '@nestjs/testing';
import { Position, RoomService } from './room.service';

// OUTDATED TESTS
// describe('RoomService', () => {
//   let service: RoomService;

//   beforeEach(async () => {
//     const module = await Test.createTestingModule({
//       providers: [RoomService],
//     }).compile();

//     service = module.get<RoomService>(RoomService);
//   });

//   afterEach(() => {
//     // Clear rooms between tests
//     jest.restoreAllMocks();
//   });

//   describe('createRoom', () => {
//     it('should create a room with valid size', () => {
//       const room = service.createRoom(2);
//       expect(room).toBeDefined();
//       expect(room.boardSize).toBe(2);
//       expect(room.state).toBe('waiting');
//       expect(room.players).toHaveLength(0);
//     });
  
//     it('should generate a 5-character uppercase ID', () => {
//       const room = service.createRoom(9);
//       expect(room.id).toHaveLength(5);
//       expect(room.id).toMatch(/^[A-Z]+$/);
//     });
  
//     it('should initialize an empty board', () => {
//       const size = 9;
//       const room = service.createRoom(size);
//       expect(room.board).toHaveLength(size);
//       room.board.forEach(row => {
//         expect(row).toHaveLength(size);
//         expect(row.every(cell => cell === 0)).toBeTruthy();
//       });
//     });
//   });

//   describe('room management', () => {
//     let roomId: string;
  
//     beforeEach(() => {
//       const room = service.createRoom(9);
//       roomId = room.id;
//     });
  
//     describe('getRoom', () => {
//       it('should return room by ID', () => {
//         const room = service.getRoom(roomId);
//         expect(room).toBeDefined();
//         expect(room?.id).toBe(roomId);
//       });
  
//       it('should return undefined for non-existent room', () => {
//         expect(service.getRoom('NONEX')).toBeUndefined();
//       });
//     });
  
//     describe('addPlayerToRoom', () => {
//       it('should add first player successfully', () => {
//         const result = service.addPlayerToRoom(roomId, 'player1');
//         expect(result).toBeTruthy();
//         expect(service.getRoom(roomId)?.players).toEqual(['player1']);
//       });
  
//       it('should add second player successfully', () => {
//         service.addPlayerToRoom(roomId, 'player1');
//         const result = service.addPlayerToRoom(roomId, 'player2');
//         expect(result).toBeTruthy();
//         expect(service.getRoom(roomId)?.players).toEqual(['player1', 'player2']);
//       });
  
//       it('should reject third player', () => {
//         service.addPlayerToRoom(roomId, 'player1');
//         service.addPlayerToRoom(roomId, 'player2');
//         const result = service.addPlayerToRoom(roomId, 'player3');
//         expect(result).toBeFalsy();
//       });
  
//       it('should reject duplicate player', () => {
//         service.addPlayerToRoom(roomId, 'player1');
//         const result = service.addPlayerToRoom(roomId, 'player1');
//         expect(result).toBeFalsy();
//       });
//     });
  
//     describe('removePlayerFromRoom', () => {
//       beforeEach(() => {
//         service.addPlayerToRoom(roomId, 'player1');
//         service.addPlayerToRoom(roomId, 'player2');
//       });
  
//       it('should remove player successfully', () => {
//         const result = service.removePlayerFromRoom(roomId, 'player1');
//         expect(result).toBeTruthy();
//         expect(service.getRoom(roomId)?.players).toEqual(['player2']);
//       });
  
//       it('should return false for non-existent player', () => {
//         const result = service.removePlayerFromRoom(roomId, 'player3');
//         expect(result).toBeFalsy();
//       });
//     });
//   });

//   describe('startGame', () => {
//     let roomId: string;
  
//     beforeEach(() => {
//       const room = service.createRoom(9);
//       roomId = room.id;
//     });
  
//     it('should start game with 2 players', () => {
//       service.addPlayerToRoom(roomId, 'player1');
//       service.addPlayerToRoom(roomId, 'player2');
//       const result = service.startGame(roomId);
//       expect(result).toBeTruthy();
//       expect(service.getRoom(roomId)?.state).toBe('playing');
//     });
  
//     it('should reset board when starting game', () => {
//       service.addPlayerToRoom(roomId, 'player1');
//       service.addPlayerToRoom(roomId, 'player2');
      
//       // Simulate a move on the "waiting" board (shouldn't happen in practice)
//       const room = service.getRoom(roomId);
//       if (room) {
//         room.board[0][0] = 1;
//       }
      
//       service.startGame(roomId);
//       expect(service.getRoom(roomId)?.board[0][0]).toBe(0);
//     });
  
//     it('should not start game with 1 player', () => {
//       service.addPlayerToRoom(roomId, 'player1');
//       const result = service.startGame(roomId);
//       expect(result).toBeFalsy();
//       expect(service.getRoom(roomId)?.state).toBe('waiting');
//     });
//   });

//   describe('move validation', () => {
//     let roomId: string;
//     const testPosition: Position = { x: 3, y: 3 };
  
//     beforeEach(() => {
//       const room = service.createRoom(9);
//       roomId = room.id;
//       service.addPlayerToRoom(roomId, 'player1');
//       service.addPlayerToRoom(roomId, 'player2');
//       service.startGame(roomId);
//     });
  
//     describe('isLegalMove', () => {
//       it('should allow legal move', () => {
//         const room = service.getRoom(roomId);
//         if (!room) fail('Room not found');
//         expect(service.isLegalMove(room, testPosition)).toBeTruthy();
//       });
  
//       it('should reject occupied position', () => {
//         const room = service.getRoom(roomId);
//         if (!room) fail('Room not found');
//         room.board[3][3] = 1; // Place black stone
//         expect(service.isLegalMove(room, testPosition)).toBeFalsy();
//       });
  
//       it('should reject out-of-bounds position', () => {
//         const room = service.getRoom(roomId);
//         if (!room) fail('Room not found');
//         expect(service.isLegalMove(room, { x: -1, y: 3 })).toBeFalsy();
//         expect(service.isLegalMove(room, { x: 9, y: 3 })).toBeFalsy();
//         expect(service.isLegalMove(room, { x: 3, y: -1 })).toBeFalsy();
//         expect(service.isLegalMove(room, { x: 3, y: 9 })).toBeFalsy();
//       });

//       it('should reject suicide move', () => {
//         const room = service.getRoom(roomId);
//         if (!room) fail('Room not found');
        
//         // Create a situation where the move would be suicide
//         room.board[2][3] = 2; // White above
//         room.board[4][3] = 2; // White below
//         room.board[3][2] = 2; // White left
//         room.board[3][4] = 2; // White right
        
//         expect(service.isLegalMove(room, testPosition)).toBeFalsy();
//       });
//     });
  
//     describe('positionHasLiberty', () => {
//       it('should detect liberty for isolated stone', () => {
//         const room = service.getRoom(roomId);
//         if (!room) fail('Room not found');
//         room.board[3][3] = 1; // Place black stone
//         expect(service.positionHasLiberty(room, testPosition, 'black', [])).toBeTruthy();
//       });
  
//       it('should detect no liberty for surrounded stone', () => {
//         const room = service.getRoom(roomId);
//         if (!room) fail('Room not found');
        
//         // Surround the stone
//         room.board[3][3] = 1; // Black stone
//         room.board[2][3] = 2; // White above
//         room.board[4][3] = 2; // White below
//         room.board[3][2] = 2; // White left
//         room.board[3][4] = 2; // White right
        
//         expect(service.positionHasLiberty(room, testPosition, 'black', [])).toBeFalsy();
//       });
//     });
//   });

//   describe('makeMove', () => {
//     let roomId: string;
//     const testPosition: Position = { x: 3, y: 3 };
  
//     beforeEach(() => {
//       const room = service.createRoom(9);
//       roomId = room.id;
//       service.addPlayerToRoom(roomId, 'player1'); // Black
//       service.addPlayerToRoom(roomId, 'player2'); // White
//       service.startGame(roomId);
//     });
  
//     it('should allow valid move by current player', () => {
//       const result = service.makeMove(roomId, 'player1', testPosition);
//       expect(result).toBeTruthy();
      
//       const room = service.getRoom(roomId);
//       expect(room?.board[3][3]).toBe(1); // Black stone
//       expect(room?.currentPlayer).toBe('white'); // Switch turn
//     });
  
//     it('should reject move by wrong player', () => {
//       const result = service.makeMove(roomId, 'player2', testPosition); // White tries to move first
//       expect(result).toBeFalsy();
//     });
  
//     it('should reject move in non-playing room', () => {
//       const room = service.getRoom(roomId);
//       if (room) room.state = 'waiting';
//       const result = service.makeMove(roomId, 'player1', testPosition);
//       expect(result).toBeFalsy();
//     });
  
//     it('should reject illegal move', () => {
//       const room = service.getRoom(roomId);
//       if (!room) fail('Room not found');
//       room.board[3][3] = 1; // Occupied position
//       const result = service.makeMove(roomId, 'player1', testPosition);
//       expect(result).toBeFalsy();
//     });
//   });
// });