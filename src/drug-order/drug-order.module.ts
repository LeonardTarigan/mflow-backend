import { Module } from '@nestjs/common';

import { DrugOrderController } from './drug-order.controller';
import { DrugOrderService } from './drug-order.service';

@Module({
  controllers: [DrugOrderController],
  providers: [DrugOrderService],
})
export class DrugOrderModule {}
