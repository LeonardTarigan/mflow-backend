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

  async delete(
    care_session_id: number,
    diagnosis_id: string,
  ): Promise<CareSessionDiagnosis> {
    return this.prisma.careSessionDiagnosis.delete({
      where: {
        care_session_id_diagnosis_id: {
          care_session_id,
          diagnosis_id,
        },
      },
    });
  }
}
