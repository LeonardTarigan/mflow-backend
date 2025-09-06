import { Injectable } from '@nestjs/common';
import { Diagnosis, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class DiagnosisRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DiagnosisCreateInput): Promise<Diagnosis> {
    return this.prisma.diagnosis.create({ data });
  }

  async findMany(keyword?: string): Promise<[Diagnosis[], number]> {
    const whereClause: Prisma.DiagnosisWhereInput = keyword
      ? {
          OR: [{ name: { contains: keyword, mode: 'insensitive' } }],
        }
      : undefined;

    return this.prisma.$transaction([
      this.prisma.diagnosis.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      this.prisma.diagnosis.count({ where: whereClause }),
    ]);
  }

  async findManyWithPagination(
    offset: number,
    limit: number,
    keyword?: string,
  ): Promise<[Diagnosis[], number]> {
    const whereClause: Prisma.DiagnosisWhereInput = keyword
      ? {
          OR: [{ name: { contains: keyword, mode: 'insensitive' } }],
        }
      : undefined;

    return this.prisma.$transaction([
      this.prisma.diagnosis.findMany({
        skip: offset,
        take: limit,
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      this.prisma.diagnosis.count({ where: whereClause }),
    ]);
  }

  async findById(id: string): Promise<Diagnosis | null> {
    return this.prisma.diagnosis.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Prisma.DiagnosisUpdateInput,
  ): Promise<Diagnosis> {
    return this.prisma.diagnosis.update({ where: { id }, data });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.diagnosis.delete({ where: { id } });
  }
}
