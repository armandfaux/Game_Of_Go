import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Position } from 'src/interface/game.interface';
import { Server, Socket } from 'socket.io';
import { GameService } from 'src/game/game.service';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly roomService: RoomService,
    private readonly gameService: GameService,
  ) {}

  handleConnection(client: any, ...args: any[]) {
    client.emit('connected', { message: 'You are connected' });
    console.log('[CONNECTION] Client', client.id);
  }

  handleDisconnect(client: any) {
    console.log('[DISCONNECTION] Client', client.id);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket, payload: { roomSize: number; boardSize: number }) {
    if (payload.roomSize < this.gameService.minPlayers || payload.roomSize > this.gameService.maxPlayers) {
      return client.emit('error', { message: 'Invalid room size' });
    }

    if (payload.boardSize < this.gameService.minBoardSize || payload.boardSize > this.gameService.maxBoardSize) {
      return client.emit('error', { message: 'Invalid board size' });
    }

    const room = this.roomService.createRoom(payload.roomSize, payload.boardSize);
    this.roomService.addPlayerToRoom(room.id, client.id);

    client.join(room.id);
    client.emit('updateRoomInfo', { 
      id: room.id,
      roomSize: payload.roomSize,
      players: room.players,
      boardSize: payload.boardSize,
      currentPlayer: room.currentPlayer,
      prisoners: room.prisoners,
      gameState: room.gameState
    });
    console.log(`[EVENT] Creating room | id: ${room.id} | board size: ${payload.boardSize} | player count: ${payload.roomSize}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomId: string) {
    const room = this.roomService.getRoom(roomId);
    if (!room) {
      return client.emit('error', { message: 'Room not found' });
    }

    const success = this.roomService.addPlayerToRoom(roomId, client.id);
    console.log("joining room", roomId, "clientId", client.id);

    if (!success) {
      return client.emit('error', { message: 'Cannot join room' });
    }

    client.join(roomId);
    this.server.to(roomId).emit('updateRoomInfo', {
      id: roomId,
      playerId: client.id,
      roomSize: room.roomSize,
      players: room.players,
      boardSize: room.boardSize,
      currentPlayer: room.currentPlayer,
      prisoners: room.prisoners,
      gameState: room.gameState,
    });
  }

  @SubscribeMessage('startGame')
  handleStartGame(client: Socket, roomId: string) {
    const room = this.roomService.getRoom(roomId);
    if (!room || !room.players.includes(client.id)) {
      return client.emit('error', { message: 'Room not found' });
    }

    const success = this.roomService.startGame(roomId);
    if (!success) {
      return client.emit('error', { message: 'Cannot start game' });
    }

    this.server.to(roomId).emit('updateRoomInfo', {
      id: room.id,
      roomSize: room.roomSize,
      board: room.board,
      boardSize: room.boardSize,
      currentPlayer: room.currentPlayer,
      gameState: room.gameState,
    });
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(client: Socket, payload: { roomId: string; position: Position }) {
    const room = this.roomService.getRoom(payload.roomId);

    if (!room) {
      return client.emit('error', { message: 'Room not found' });
    }

    // Execute move
    const success = this.gameService.makeMove(
      room,
      client.id,
      payload.position,
    );
    
    if (success) {
      // console.log('[CLIENT', client.id, 'SENT] \'makeMove\' at position:', payload.position);
      this.server.to(payload.roomId).emit('moveMade', {
        position: payload.position,
        currentPlayer: room.currentPlayer,
        board: room.board,
        prisoners: room.prisoners,
        koPosition: room.koPosition,
      });
    } else {
      client.emit('invalidMove', { position: payload.position });
    }
  }

  @SubscribeMessage('passTurn')
  handlePassTurn(client: Socket, roomId: string) {
    const room = this.roomService.getRoom(roomId);

    if (!room) {
      return client.emit('error', { message: 'Room not found' });
    }

    const success = this.gameService.passTurn(room, client.id);

    if (success) {
      this.server.to(roomId).emit('turnPassed', {
        currentPlayer: room.currentPlayer,
      });
      if (room.gameState === 'scoring') {
        this.server.to(roomId).emit('updateRoomInfo', {
          id: room.id,
          gameState: room.gameState,
        });
      }
    } else {
      client.emit('error', { message: 'Cannot pass turn' });
    }
  }

  @SubscribeMessage('resign')
  handleResign(client: Socket, roomId: string) {
    const room = this.roomService.getRoom(roomId);

    if (!room) {
      return client.emit('error', { message: 'Room not found' });
    }

    const success = this.gameService.resign(room, client.id);

    if (success) {
      this.server.to(roomId).emit('updateRoomInfo', {
        id: room.id,
        gameState: room.gameState,
      });
    } else {
      client.emit('error', { message: 'Cannot resign' });
    }
  }

  @SubscribeMessage('markStone')
  handleMarkStone(client: Socket, payload: { roomId: string; position: Position }) {

    const room = this.roomService.getRoom(payload.roomId);

    if (!room) {
      return client.emit('error', { message: 'Room not found' });
    }

    const success = this.gameService.markGroup(room, client.id, payload.position);

    if (success) {
      this.server.to(payload.roomId).emit('stoneMarked', {
        markedStones: room.markedStones,
      });
    } else {
      client.emit('error', { message: 'Cannot mark stone' });
    }
  }

  @SubscribeMessage('confirmMarking')
  handleConfirmMarking(client: Socket, roomId: string) {
    const room = this.roomService.getRoom(roomId);

    if (!room) {
      return client.emit('error', { message: 'Room not found' });
    }
    
    const success = this.gameService.confirmMarking(room, client.id);

    if (success) {
      if (room.gameState === 'scoring') {
        this.server.to(roomId).emit('markingConfirmed', {
          roomId: room.id,
          gameState: room.gameState,
          playersConfirmed: room.playersConfirmed,
        });
      } else if (room.gameState === 'finished') {
          this.server.to(roomId).emit('updateRoomInfo', {
            id: room.id,
            board: room.board,
            gameState: room.gameState,
            scores: room.scores,
        });
      }
    } else {
      client.emit('error', { message: 'Cannot confirm marking' });
    }
  }
}
