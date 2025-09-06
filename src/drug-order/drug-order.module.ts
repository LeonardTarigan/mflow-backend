import { Module } from '@nestjs/common';

import { DrugOrderController } from './drug-order.controller';
import { DrugOrderService } from './drug-order.service';
import { DrugOrderRepository } from './infrastucture/drug-order.repository';

@Module({
  controllers: [DrugOrderController],
  providers: [DrugOrderService, DrugOrderRepository],
})
export class DrugOrderModule {}
