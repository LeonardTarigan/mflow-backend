import { Module } from '@nestjs/common';

import { TreatmentRepository } from './infrastructure/treatment.repository';
import { TreatmentController } from './treatment.controller';
import { TreatmentService } from './treatment.service';

@Module({
  providers: [TreatmentService, TreatmentRepository],
  controllers: [TreatmentController],
  exports: [TreatmentService],
})
export class TreatmentModule {}
