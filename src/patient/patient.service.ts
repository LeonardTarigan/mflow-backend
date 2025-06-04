import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { AddPatientDto, AddPatientResponse } from './patient.model';
import { PatientValidation } from './patient.validation';

@Injectable()
export class PatientService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async add(dto: AddPatientDto): Promise<AddPatientResponse> {
    this.logger.info(`PatientService.add(${JSON.stringify(dto)})`);

    const request = this.validationService.validate<AddPatientDto>(
      PatientValidation.ADD,
      dto,
    );

    const res = await this.prismaService.patient.create({
      data: request,
    });

    return res;
  }
}
