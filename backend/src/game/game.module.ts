import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { RoomModule } from 'src/room/room.module';

@Module({
    providers: [GameService],
    exports: [GameService],
})
export class GameModule {}
