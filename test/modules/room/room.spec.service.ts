import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class RoomTestService {
  constructor(private prismaService: PrismaService) {}

  readonly TEST_ROOM_NAME = 'testing_name';

  async deleteRoom() {
    if (!this.prismaService?.drug) {
      throw new Error('Room model is undefined in PrismaService.');
    }

    await this.prismaService.room.deleteMany({
      where: {
        name: this.TEST_ROOM_NAME,
      },
    });
  }

  async createRoom() {
    await this.prismaService.room.create({
      data: {
        name: this.TEST_ROOM_NAME,
      },
    });
  }
}
