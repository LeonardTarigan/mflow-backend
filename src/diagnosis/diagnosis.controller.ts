import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';
import {
  AddDiagnosisDto,
  AddDiagnosisResponse,
  AddSessionDiagnosisDto,
  AddSessionDiagnosisResponse,
} from './diagnosis.model';
import { DiagnosisService } from './diagnosis.service';

@Controller('/api/diagnoses')
export class DiagnosisController {
  constructor(private diagnosisService: DiagnosisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body() dto: AddDiagnosisDto,
  ): Promise<ApiResponse<AddDiagnosisResponse>> {
    const res = await this.diagnosisService.add(dto);

    return { data: res };
  }

  @Post('/sessions')
  @HttpCode(HttpStatus.CREATED)
  async addToSession(
    @Body() dto: AddSessionDiagnosisDto,
  ): Promise<ApiResponse<AddSessionDiagnosisResponse>> {
    const res = await this.diagnosisService.addSessionDiagnosis(dto);

    return { data: res };
  }
}
