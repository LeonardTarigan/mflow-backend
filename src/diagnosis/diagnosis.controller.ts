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

import { DiagnosisService } from './diagnosis.service';
import {
  CreateDiagnosisDto,
  CreateDiagnosisResponse,
  DiagnosisEntity,
} from './domain/model/diagnosis.model';

@Controller('/api/diagnoses')
export class DiagnosisController {
  constructor(private diagnosisService: DiagnosisService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('query') query: string,
  ): Promise<ApiResponse<DiagnosisEntity[]>> {
    const { data } = await this.diagnosisService.getAll(query);

    return {
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body() dto: CreateDiagnosisDto,
  ): Promise<ApiResponse<CreateDiagnosisResponse>> {
    const res = await this.diagnosisService.create(dto);

    return { data: res };
  }
}
