import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { AddDiagnosisDto, AddDiagnosisResponse } from './diagnosis.model';
import { ApiResponse } from 'src/common/api.model';

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
}
