import { Module } from '@nestjs/common';

import { PatientRepository } from './infrastucture/patient.repository';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';

@Module({
  providers: [PatientService, PatientRepository],
  controllers: [PatientController],
})
export class PatientModule {}
