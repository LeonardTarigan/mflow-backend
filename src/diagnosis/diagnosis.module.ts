import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';
import { DiagnosisRepository } from './infrastucture/diagnosis.repository';

@Module({
  imports: [HttpModule],
  providers: [DiagnosisService, DiagnosisRepository],
  controllers: [DiagnosisController],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}
