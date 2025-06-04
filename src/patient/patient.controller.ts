import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';
import { AddPatientDto, AddPatientResponse } from './patient.model';
import { PatientService } from './patient.service';

@Controller('/api/patients')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body() dto: AddPatientDto,
  ): Promise<ApiResponse<AddPatientResponse>> {
    const res = await this.patientService.add(dto);

    return { data: res };
  }
}
