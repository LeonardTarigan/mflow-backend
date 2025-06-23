import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';
import {
  AddDiagnosisDto,
  AddDiagnosisResponse,
  AddSessionDiagnosisDto,
  AddSessionDiagnosisResponse,
  Diagnosis,
} from './diagnosis.model';
import { DiagnosisService } from './diagnosis.service';

@Controller('/api/diagnoses')
export class DiagnosisController {
  constructor(private diagnosisService: DiagnosisService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('query') query: string,
  ): Promise<ApiResponse<Diagnosis[]>> {
    const { data } = await this.diagnosisService.getAll(query);

    return {
      data,
    };
  }

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
  ): Promise<ApiResponse<AddSessionDiagnosisResponse[]>> {
    const res = await this.diagnosisService.addSessionDiagnoses(dto);
    return { data: res };
  }
}
