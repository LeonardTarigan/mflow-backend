import { Injectable } from '@nestjs/common';
import { Patient, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class PatientFactory {
  constructor(private prismaService: PrismaService) {}

  async create(
    data: Partial<Prisma.PatientCreateInput> = {},
  ): Promise<Patient> {
    const defaultData: Prisma.PatientCreateInput = {
      name: `Test Patient ${Date.now()}`,
      nik: String(
        Math.floor(1000000000000000 + Math.random() * 9000000000000000),
      ),
      birth_date: new Date('1990-01-01'),
      address: 'Test Address',
      occupation: 'Tester',
      phone_number: `628${Math.floor(100000000 + Math.random() * 900000000)}`,
      gender: 'MALE',
      ...data,
    };
    return this.prismaService.patient.create({ data: defaultData });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.patient.delete({ where: { id } }).catch(() => {});
  }
}
