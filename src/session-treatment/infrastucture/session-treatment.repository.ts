import { Injectable } from '@nestjs/common';
import { CareSessionTreatment, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class SessionTreatmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.CareSessionTreatmentUncheckedCreateInput,
  ): Promise<CareSessionTreatment> {
    return this.prisma.careSessionTreatment.create({ data });
  }

  async delete(
    careSessionId: number,
    treatmentId: number,
  ): Promise<CareSessionTreatment> {
    return this.prisma.careSessionTreatment.delete({
      where: {
        care_session_id_treatment_id: {
          care_session_id: careSessionId,
          treatment_id: treatmentId,
        },
      },
    });
  }
}
