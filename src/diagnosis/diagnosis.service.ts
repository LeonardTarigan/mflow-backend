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
  GetAllDiagnosesResponse,
} from './diagnosis.model';

@Injectable()
export class DiagnosisService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async getAll(query: string): Promise<GetAllDiagnosesResponse> {
    this.logger.info(`DiagnosisService.getAll(query=${query})`);

    const diagnoses = await this.prismaService.diagnosis.findMany({
      where: {
        OR: [
          {
            id: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    return {
      data: diagnoses,
    };
  }

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

  async addSessionDiagnoses(
    dto: AddSessionDiagnosisDto,
  ): Promise<AddSessionDiagnosisResponse[]> {
    const request = this.validationService.validate(
      DiagnosisValidation.ADD_SESSION_DIAGNOSIS,
      dto,
    );

    const created = await this.prismaService.$transaction(
      request.diagnosis_ids.map((diagnosis_id) =>
        this.prismaService.careSessionDiagnosis.create({
          data: {
            care_session_id: request.care_session_id,
            diagnosis_id,
          },
        }),
      ),
    );

    return created;
  }
}
