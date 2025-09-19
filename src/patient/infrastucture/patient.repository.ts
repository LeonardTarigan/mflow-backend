import { Injectable } from '@nestjs/common';
import { Patient, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

import { UpdatePatientDto } from '../domain/model/patient.model';

@Injectable()
export class PatientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PatientCreateInput): Promise<Patient> {
    return this.prisma.patient.create({ data });
  }

  async findMany(keyword?: string): Promise<[Patient[], number]> {
    const whereClause: Prisma.PatientWhereInput = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            {
              medical_record_number: { contains: keyword, mode: 'insensitive' },
            },
            { nik: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const patients = await this.prisma.patient.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    return [patients, patients.length];
  }

  async findManyWithPagination(
    offset: number,
    limit: number,
    keyword?: string,
  ): Promise<[Patient[], number]> {
    const whereClause: Prisma.PatientWhereInput = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            {
              medical_record_number: { contains: keyword, mode: 'insensitive' },
            },
            { nik: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    return this.prisma.$transaction([
      this.prisma.patient.findMany({
        skip: offset,
        take: limit,
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      this.prisma.patient.count({ where: whereClause }),
    ]);
  }

  async findByMrNumber(mrNumber: string): Promise<Patient | null> {
    return this.prisma.patient.findUnique({
      where: { medical_record_number: mrNumber },
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async findLastestPatientMrn() {
    const patient = await this.prisma.patient.findFirst({
      where: {
        medical_record_number: { not: null },
      },
      orderBy: {
        medical_record_number: 'desc',
      },
      select: {
        medical_record_number: true,
      },
    });

    return patient;
  }

  async update(id: string, data: UpdatePatientDto): Promise<Patient> {
    return this.prisma.patient.update({ where: { id }, data });
  }
}
