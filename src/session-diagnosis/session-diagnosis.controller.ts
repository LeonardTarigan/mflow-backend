import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';

import {
  CreateSessionDiagnosisDto,
  DeleteSessionDiagnosisDto,
  DeleteSessionDiagnosisResponse,
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

  @Delete()
  @HttpCode(HttpStatus.OK)
  async delete(
    @Body() dto: DeleteSessionDiagnosisDto,
  ): Promise<ApiResponse<DeleteSessionDiagnosisResponse>> {
    const res = await this.sessionDiagnosisService.delete(dto);

    return { data: res };
  }
}
