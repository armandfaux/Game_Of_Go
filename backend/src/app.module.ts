import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomModule } from './room/room.module';

@Module({
  imports: [RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
