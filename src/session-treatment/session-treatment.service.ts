import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { TreatmentService } from 'src/treatment/treatment.service';
import { Logger } from 'winston';

import {
  CreateSessionTreatmentDto,
  CreateSessionTreatmentResponse,
} from './domain/model/session-treatment.model';
import { SessionTreatmentRepository } from './infrastucture/session-treatment.repository';

@Injectable()
export class SessionTreatmentService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private treatmentService: TreatmentService,
    private sessionTreatmentRepository: SessionTreatmentRepository,
  ) {}

  async create(
    dto: CreateSessionTreatmentDto,
  ): Promise<CreateSessionTreatmentResponse> {
    this.logger.info(`SessionTreatmentService.create(${JSON.stringify(dto)})`);

    try {
      const treatment = await this.treatmentService.getById(dto.treatment_id);

      const res = await this.sessionTreatmentRepository.create({
        ...dto,
        applied_price: treatment.price,
      });

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2003: 'ID pelayanan tidak ditemukan!',
      });

      this.logger.error(`Error adding session treatment: ${error.message}`);
      throw error;
    }
  }
}
