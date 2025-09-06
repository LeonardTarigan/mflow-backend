import { Module } from '@nestjs/common';
import { DiagnosisModule } from 'src/diagnosis/diagnosis.module';

import { SessionDiagnosisRepository } from './infrastucture/session-diagnosis.repository';
import { SessionDiagnosisController } from './session-diagnosis.controller';
import { SessionDiagnosisService } from './session-diagnosis.service';

@Module({
  imports: [DiagnosisModule],
  providers: [SessionDiagnosisService, SessionDiagnosisRepository],
  controllers: [SessionDiagnosisController],
})
export class SessionDiagnosisModule {}
