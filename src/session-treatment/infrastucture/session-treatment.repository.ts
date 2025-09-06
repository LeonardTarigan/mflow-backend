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
}
