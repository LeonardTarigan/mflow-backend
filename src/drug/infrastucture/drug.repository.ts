import { Injectable } from '@nestjs/common';
import { Drug, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class DrugRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DrugCreateInput): Promise<Drug> {
    return this.prisma.drug.create({ data });
  }

  async findMany(keyword?: string): Promise<[Drug[], number]> {
    const whereClause: Prisma.DrugWhereInput = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { unit: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    return this.prisma.$transaction([
      this.prisma.drug.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      this.prisma.drug.count({ where: whereClause }),
    ]);
  }

  async findManyWithPagination(
    offset: number,
    limit: number,
    keyword?: string,
  ): Promise<[Drug[], number]> {
    const whereClause: Prisma.DrugWhereInput = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { unit: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    return this.prisma.$transaction([
      this.prisma.drug.findMany({
        skip: offset,
        take: limit,
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      this.prisma.drug.count({ where: whereClause }),
    ]);
  }

  async findById(id: number): Promise<Drug | null> {
    return this.prisma.drug.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.DrugUpdateInput): Promise<Drug> {
    return this.prisma.drug.update({ where: { id }, data });
  }

  async deleteById(id: number): Promise<void> {
    await this.prisma.drug.delete({ where: { id } });
  }
}
