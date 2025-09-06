import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';

import {
  CreateSessionTreatmentDto,
  CreateSessionTreatmentResponse,
} from './domain/model/session-treatment.model';
import { SessionTreatmentService } from './session-treatment.service';

@Controller('/api/session-treatments')
export class SessionTreatmentController {
  constructor(private sessionTreatmentService: SessionTreatmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addToSession(
    @Body() dto: CreateSessionTreatmentDto,
  ): Promise<ApiResponse<CreateSessionTreatmentResponse>> {
    const res = await this.sessionTreatmentService.create(dto);

    return { data: res };
  }
}
