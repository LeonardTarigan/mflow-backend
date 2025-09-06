import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { Logger } from 'winston';

import {
  CreateDrugOrderDto,
  CreateDrugOrderResponse,
} from './domain/model/drug.order.model';
import { DrugOrderRepository } from './infrastucture/drug-order.repository';

@Injectable()
export class DrugOrderService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private drugOrderRepository: DrugOrderRepository,
  ) {}

  async create(dto: CreateDrugOrderDto): Promise<CreateDrugOrderResponse> {
    this.logger.info(`DrugOrderService.add(${JSON.stringify(dto)})`);

    try {
      const res = await this.drugOrderRepository.create(dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2003: 'ID pelayanan atau obat tidak ditemukan!',
      });

      this.logger.error(`Error adding drug order: ${error.message}`);
      throw error;
    }
  }
}
