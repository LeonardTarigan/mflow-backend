import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { DiagnosisService } from 'src/diagnosis/diagnosis.service';
import { Logger } from 'winston';

import {
  CreateSessionDiagnosisDto,
  CreateSessionDiagnosisResponse,
} from './domain/model/session-diagnosis.model';
import { SessionDiagnosisRepository } from './infrastucture/session-diagnosis.repository';

@Injectable()
export class SessionDiagnosisService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private diagnosisService: DiagnosisService,
    private sessionDiagnosisRepository: SessionDiagnosisRepository,
  ) {}

  async create(
    dto: CreateSessionDiagnosisDto,
  ): Promise<CreateSessionDiagnosisResponse> {
    this.logger.info(`SessionDiagnosisService.create(${JSON.stringify(dto)})`);

    try {
      const diagnosis = await this.diagnosisService.getById(dto.diagnosis_id);

      if (!diagnosis) {
        await this.diagnosisService.create({
          id: dto.diagnosis_id,
          name: dto.diagnosis_name,
        });
      }

      const res = await this.sessionDiagnosisRepository.create(dto);

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
