import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';

import { AddDrugOrderDto, AddDrugOrderResponse } from './drug-order.model';
import { DrugOrderValidation } from './drug-order.validation';

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
      const transactions = [];

      for (const drug of request.drugs) {
        transactions.push(
          this.prismaService.drugOrder.create({
            data: {
              care_session_id: request.care_session_id,
              drug_id: drug.drug_id,
              quantity: drug.quantity,
              dose: drug.dose,
            },
          }),
        );

        transactions.push(
          this.prismaService.drug.update({
            where: { id: drug.drug_id },
            data: {
              amount_sold: {
                increment: drug.quantity,
              },
            },
          }),
        );
      }

      await this.prismaService.$transaction(transactions);

      return request.drugs.map((drug) => ({
        care_session_id: request.care_session_id,
        ...drug,
      }));
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
