import { Module } from '@nestjs/common';
import { DrugModule } from 'src/drug/drug.module';

import { DrugOrderController } from './drug-order.controller';
import { DrugOrderService } from './drug-order.service';
import { DrugOrderRepository } from './infrastucture/drug-order.repository';

@Module({
  imports: [DrugModule],
  controllers: [DrugOrderController],
  providers: [DrugOrderService, DrugOrderRepository],
})
export class DrugOrderModule {}
