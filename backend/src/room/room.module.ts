import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomGateway } from './room.gateway';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [GameModule],
  providers: [RoomService, RoomGateway],
})
export class RoomModule {}
