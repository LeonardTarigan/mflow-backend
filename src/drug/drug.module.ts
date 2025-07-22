import { Module } from '@nestjs/common';

import { DrugController } from './drug.controller';
import { DrugService } from './drug.service';

@Module({
  providers: [DrugService],
  controllers: [DrugController],
})
export class DrugModule {}
