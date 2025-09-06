import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { Logger } from 'winston';

import {
  CreateDiagnosisDto,
  CreateDiagnosisResponse,
  GetAllDiagnosesResponse,
  GetDiagnosisByIdResponse,
} from './domain/model/diagnosis.model';
import { DiagnosisRepository } from './infrastucture/diagnosis.repository';

@Injectable()
export class DiagnosisService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private diagnosisRepository: DiagnosisRepository,
  ) {}

  async create(dto: CreateDiagnosisDto): Promise<CreateDiagnosisResponse> {
    this.logger.info(`DiagnosisService.add(${JSON.stringify(dto)})`);

    try {
      const res = await this.diagnosisRepository.create(dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2002: `Diagnosis dengan kode ${dto.id} sudah terdaftar!`,
      });

      throw error;
    }
  }

  async getAll(query: string): Promise<GetAllDiagnosesResponse> {
    this.logger.info(`DiagnosisService.getAll(query=${query})`);

    const [diagnoses] = await this.diagnosisRepository.findMany(query);

    return {
      data: diagnoses,
    };
  }

  async getById(id: string): Promise<GetDiagnosisByIdResponse> {
    this.logger.info(`TreatementService.getById(${id})`);

    const treatment = await this.diagnosisRepository.findById(id);

    if (!treatment)
      throw new HttpException(
        'Data diagnosis tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return treatment;
  }
}
