import { Injectable } from '@nestjs/common';
import { Prisma, Treatment } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class TreatmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TreatmentCreateInput): Promise<Treatment> {
    return this.prisma.treatment.create({ data });
  }

  async findMany(keyword?: string): Promise<[Treatment[], number]> {
    const whereClause: Prisma.TreatmentWhereInput = keyword
      ? {
          OR: [{ name: { contains: keyword, mode: 'insensitive' } }],
        }
      : undefined;

    return this.prisma.$transaction([
      this.prisma.treatment.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      this.prisma.treatment.count({ where: whereClause }),
    ]);
  }

  async findManyWithPagination(
    offset: number,
    limit: number,
    keyword?: string,
  ): Promise<[Treatment[], number]> {
    const whereClause: Prisma.TreatmentWhereInput = keyword
      ? {
          OR: [{ name: { contains: keyword, mode: 'insensitive' } }],
        }
      : undefined;

    return this.prisma.$transaction([
      this.prisma.treatment.findMany({
        skip: offset,
        take: limit,
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      this.prisma.treatment.count({ where: whereClause }),
    ]);
  }

  async findById(id: number): Promise<Treatment | null> {
    return this.prisma.treatment.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: Prisma.TreatmentUpdateInput,
  ): Promise<Treatment> {
    return this.prisma.treatment.update({ where: { id }, data });
  }

  async deleteById(id: number): Promise<void> {
    await this.prisma.treatment.delete({ where: { id } });
  }
}
