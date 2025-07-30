import { Injectable } from '@nestjs/common';
import { Room, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class RoomFactory {
  constructor(private prismaService: PrismaService) {}

  async create(data: Partial<Prisma.RoomCreateInput> = {}): Promise<Room> {
    const defaultData: Prisma.RoomCreateInput = {
      name: `Test Room ${Date.now()}`,
      ...data,
    };
    return this.prismaService.room.create({ data: defaultData });
  }

  async delete(id: number): Promise<void> {
    await this.prismaService.room.delete({ where: { id } }).catch(() => {});
  }
}
