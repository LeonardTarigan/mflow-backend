import { Module } from '@nestjs/common';
import { TreatmentModule } from 'src/treatment/treatment.module';

import { SessionTreatmentRepository } from './infrastucture/session-treatment.repository';
import { SessionTreatmentController } from './session-treatment.controller';
import { SessionTreatmentService } from './session-treatment.service';

@Module({
  imports: [TreatmentModule],
  providers: [SessionTreatmentService, SessionTreatmentRepository],
  controllers: [SessionTreatmentController],
})
export class SessionTreatmentModule {}
