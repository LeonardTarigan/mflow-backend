import { Module } from '@nestjs/common';

import { DrugController } from './drug.controller';
import { DrugService } from './drug.service';
import { DrugRepository } from './infrastucture/drug.repository';

@Module({
  providers: [DrugService, DrugRepository],
  controllers: [DrugController],
})
export class DrugModule {}
