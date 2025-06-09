import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';
import {
  AddPatientDto,
  AddPatientResponse,
  PatientDetail,
} from './patient.model';
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

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page') page: string,
    @Query('search') search: string,
    @Query('pageSize') pageSize: string,
  ): Promise<ApiResponse<PatientDetail[]>> {
    const parsedPageSize = pageSize ? parseInt(pageSize, 10) : undefined;

    const { data, meta } = await this.patientService.getAll(
      page,
      search,
      parsedPageSize,
    );

    return {
      data,
      meta,
    };
  }

  @Get('/:mrNumber([\\w\\.]+)')
  @HttpCode(HttpStatus.OK)
  async getByMrNumber(
    @Param('mrNumber') mrNumber: string,
  ): Promise<ApiResponse<PatientDetail>> {
    const res = await this.patientService.getByMrNumber(mrNumber);
    return { data: res };
  }
}
