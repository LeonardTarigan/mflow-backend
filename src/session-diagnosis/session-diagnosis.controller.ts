import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';

import {
  CreateSessionDiagnosisDto,
  SessionDiagnosisEntity,
} from './domain/model/session-diagnosis.model';
import { SessionDiagnosisService } from './session-diagnosis.service';

@Controller('/api/session-diagnosis')
export class SessionDiagnosisController {
  constructor(private sessionDiagnosisService: SessionDiagnosisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSessionDiagnosisDto,
  ): Promise<ApiResponse<SessionDiagnosisEntity>> {
    const res = await this.sessionDiagnosisService.create(dto);
    return { data: res };
  }
}
