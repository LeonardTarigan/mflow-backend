import { Injectable } from '@nestjs/common';
import { Prisma, Room } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class RoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.RoomCreateInput): Promise<Room> {
    return this.prisma.room.create({ data });
  }

  async findMany(keyword?: string): Promise<[Room[], number]> {
    const whereClause: Prisma.RoomWhereInput = keyword
      ? {
          OR: [{ name: { contains: keyword, mode: 'insensitive' } }],
        }
      : undefined;

    return this.prisma.$transaction([
      this.prisma.room.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      this.prisma.room.count({ where: whereClause }),
    ]);
  }

  async findManyWithPagination(
    offset: number,
    limit: number,
    keyword?: string,
  ): Promise<[Room[], number]> {
    const whereClause: Prisma.RoomWhereInput = keyword
      ? {
          OR: [{ name: { contains: keyword, mode: 'insensitive' } }],
        }
      : undefined;

    return this.prisma.$transaction([
      this.prisma.room.findMany({
        skip: offset,
        take: limit,
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      this.prisma.room.count({ where: whereClause }),
    ]);
  }

  async count(where?: Prisma.RoomWhereInput): Promise<number> {
    return this.prisma.room.count({ where });
  }

  async update(id: number, data: Prisma.RoomUpdateInput): Promise<Room> {
    return this.prisma.room.update({ where: { id }, data });
  }

  async deleteById(id: number): Promise<void> {
    await this.prisma.room.delete({ where: { id } });
  }
}
