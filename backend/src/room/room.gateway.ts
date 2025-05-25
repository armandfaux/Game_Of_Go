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
export class RoomGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly roomService: RoomService,
    private readonly gameService: GameService,
  ) {}

  private minRoomSize = 2;
  private maxRoomSize = 4;

  private minBoardSize = 9;
  private maxBoardSize = 19;

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    client.emit('connected', { message: 'You are connected' });
    console.log('[CONNECTION] Client ', client.id);
  }

  handleDisconnect(client: any) {
    console.log('[DISCONNECTION] Client ', client.id);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket, payload: { roomSize: number; boardSize: number }) {
    if (payload.roomSize < this.minRoomSize || payload.roomSize > this.maxRoomSize) {
      return client.emit('error', { message: 'Invalid room size' });
    }

    if (payload.boardSize < this.minBoardSize || payload.boardSize > this.maxBoardSize) {
      return client.emit('error', { message: 'Invalid board size' });
    }

    const room = this.roomService.createRoom(payload.roomSize, payload.boardSize);
    this.roomService.addPlayerToRoom(room.id, client.id);

    client.join(room.id);
    client.emit('roomCreated', { 
      roomId: room.id,
      roomSize: payload.roomSize,
      players: room.players,
      boardSize: payload.boardSize,
      currentPlayer: room.currentPlayer,
      gameState: room.state
    });
    console.log('[EVENT] Creating room with id:', room.id, 'board size:', payload.boardSize, 'and player count:', payload.roomSize);
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
    this.server.to(roomId).emit('playerJoined', {
      playerId: client.id,
      roomId: roomId,
      roomSize: room.roomSize,
      players: room.players,
      boardSize: room.boardSize,
      currentPlayer: room.currentPlayer,
      gameState: room.state,
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

    this.server.to(roomId).emit('gameStarted', {
      roomId: room.id,
      roomSize: room.roomSize,
      board: room.board,
      boardSize: room.boardSize,
      currentPlayer: room.currentPlayer,
      gameState: room.state,
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
        koPosition: room.koInfo.position,
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
    } else {
      client.emit('error', { message: 'Cannot pass turn' });
    }
  }

  @SubscribeMessage('resign')
  handleResign(client: Socket, roomId: string) {
  }

}
