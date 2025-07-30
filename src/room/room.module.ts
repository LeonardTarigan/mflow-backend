import { Module } from '@nestjs/common';

import { RoomRepository } from './infrastructure/room.repository';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  providers: [RoomService, RoomRepository],
  controllers: [RoomController],
})
export class RoomModule {}
