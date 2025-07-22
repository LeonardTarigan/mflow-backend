import { Module } from '@nestjs/common';

import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';

@Module({
  providers: [PatientService],
  controllers: [PatientController],
})
export class PatientModule {}
