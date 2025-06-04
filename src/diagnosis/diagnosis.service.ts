import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { DiagnosisValidation } from './diagnosis.validation';
import {
  AddDiagnosisDto,
  AddDiagnosisResponse,
  AddSessionDiagnosisDto,
  AddSessionDiagnosisResponse,
} from './diagnosis.model';

@Injectable()
export class DiagnosisService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async add(dto: AddDiagnosisDto): Promise<AddDiagnosisResponse> {
    this.logger.info(`DiagnosisService.add(${JSON.stringify(dto)})`);

    const request = this.validationService.validate<any>(
      DiagnosisValidation.ADD,
      dto,
    );

    const res = await this.prismaService.diagnosis.create({
      data: request,
    });

    return res;
  }

  async addSessionDiagnosis(
    dto: AddSessionDiagnosisDto,
  ): Promise<AddSessionDiagnosisResponse> {
    this.logger.info(
      `DiagnosisService.addSessionDiagnosis(${JSON.stringify(dto)})`,
    );

    const request = this.validationService.validate<any>(
      DiagnosisValidation.ADD_SESSION_DIAGNOSIS,
      dto,
    );

    const res = await this.prismaService.careSessionDiagnosis.create({
      data: request,
    });

    return res;
  }
}
