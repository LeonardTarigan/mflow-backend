import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { DrugOrderValidation } from './drug-order.validation';
import { AddDrugOrderDto, AddDrugOrderResponse } from './drug-order.model';

@Injectable()
export class DrugOrderService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async add(dto: AddDrugOrderDto): Promise<AddDrugOrderResponse> {
    this.logger.info(`DrugOrderService.add(${JSON.stringify(dto)})`);

    const request = this.validationService.validate(
      DrugOrderValidation.ADD,
      dto,
    );

    try {
      const [drugOrder] = await this.prismaService.$transaction([
        this.prismaService.drugOrder.create({
          data: request,
        }),
        this.prismaService.drug.update({
          where: { id: request.drug_id },
          data: {
            amount_sold: {
              increment: request.quantity,
            },
          },
        }),
      ]);
      return drugOrder;
    } catch (error) {
      if (error.code === 'P2003') {
        this.logger.error('Care session or drug not found');
        throw new Error('ID pelayanan atau obat tidak ditemukan!');
      }
      this.logger.error(`Error adding drug order: ${error.message}`);
      throw error;
    }
  }
}
