import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';

import {
  AddVitalSignDto,
  AddVitalSignResponse,
  GetVitalSignByIdResponse,
} from './vital-sign.model';
import { VitalSignValidation } from './vital-sign.validation';

@Injectable()
export class VitalSignService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async add(dto: AddVitalSignDto): Promise<AddVitalSignResponse> {
    this.logger.info(`VitalSignService.addVitalSign(${JSON.stringify(dto)})`);

    const request = this.validationService.validate(
      VitalSignValidation.ADD,
      dto,
    );

    try {
      const res = await this.prismaService.vitalSign.create({
        data: request,
      });
      return res;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        this.logger.error('Care session not found');
        throw new HttpException(
          'ID pelayanan tidak ditemukan!',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.error(`Error adding vital sign: ${error.message}`);
      throw error;
    }
  }

  async getById(id: string): Promise<GetVitalSignByIdResponse> {
    this.logger.info(`VitalSignService.getById(${id})`);

    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      throw new HttpException('ID tidak valid!', HttpStatus.BAD_REQUEST);
    }

    const vitalSignData = await this.prismaService.vitalSign.findUnique({
      where: { id: numericId },
    });

    if (!vitalSignData) {
      throw new HttpException(
        'Data vital sign tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );
    }

    return vitalSignData;
  }
}
