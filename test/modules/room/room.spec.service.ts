import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { RoomEntity } from 'src/room/room.model';

@Injectable()
export class RoomTestService {
  constructor(private prismaService: PrismaService) {}

  readonly TEST_ROOM_NAME = 'testing_name';

  async createTestRoom(): Promise<RoomEntity> {
    const room = await this.prismaService.room.create({
      data: {
        name: this.TEST_ROOM_NAME,
      },
    });

    return room;
  }

  async deleteTestRoom(id: number): Promise<void> {
    await this.prismaService.room.delete({
      where: {
        id,
      },
    });
  }
}
