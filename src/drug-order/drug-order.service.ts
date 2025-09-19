import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { DrugService } from 'src/drug/drug.service';
import { Logger } from 'winston';

import {
  CreateDrugOrderDto,
  CreateDrugOrderResponse,
  DeleteDrugOrderResponse,
} from './domain/model/drug.order.model';
import { DrugOrderRepository } from './infrastucture/drug-order.repository';

@Injectable()
export class DrugOrderService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private drugService: DrugService,
    private drugOrderRepository: DrugOrderRepository,
  ) {}

  async create(dto: CreateDrugOrderDto): Promise<CreateDrugOrderResponse> {
    this.logger.info(`DrugOrderService.add(${JSON.stringify(dto)})`);

    try {
      const drug = await this.drugService.getById(dto.drug_id);

      if (!drug) {
        throw new HttpException(
          'Data obat tidak ditemukan',
          HttpStatus.NOT_FOUND,
        );
      }

      if (drug.stock < dto.quantity) {
        throw new HttpException(
          `Stok ${drug.name} tidak mencukupi. Stok tersedia: ${drug.stock} ${drug.unit}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const res = await this.drugOrderRepository.createWithStockUpdate(
        dto,
        drug.id,
        dto.quantity,
        drug.price,
      );

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2003: 'ID pelayanan tidak ditemukan!',
      });

      this.logger.error(`Error adding drug order: ${error.message}`);
      throw error;
    }
  }

  async delete(id: number): Promise<DeleteDrugOrderResponse> {
    this.logger.info(`DrugOrderService.delete(${JSON.stringify(id)})`);

    try {
      const res = await this.drugOrderRepository.deleteByIdWithStockUpdate(id);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2003: 'ID pelayanan tidak ditemukan!',
      });

      this.logger.error(`Error deleting drug order: ${error.message}`);
      throw error;
    }
  }
}
