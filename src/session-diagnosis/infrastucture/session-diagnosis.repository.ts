import { Injectable } from '@nestjs/common';
import { CareSessionDiagnosis, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class SessionDiagnosisRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.CareSessionDiagnosisUncheckedCreateInput,
  ): Promise<CareSessionDiagnosis> {
    return this.prisma.careSessionDiagnosis.create({ data });
  }
}
