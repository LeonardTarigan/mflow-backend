import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { AddDrugDto, AddDrugResponse } from './drug.model';
import { DrugValidation } from './drug.validation';

@Injectable()
export class DrugService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async add(dto: AddDrugDto): Promise<AddDrugResponse> {
    this.logger.info(`DrugService.add(${JSON.stringify(dto)})`);

    const request = this.validationService.validate<AddDrugDto>(
      DrugValidation.ADD,
      dto,
    );

    const res = await this.prismaService.drug.create({
      data: request,
    });

    return res;
  }
}
