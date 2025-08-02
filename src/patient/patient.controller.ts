import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';

import {
  CreatePatientDto,
  PatientEntity,
  UpdatePatientDto,
} from './domain/model/patient.model';
import { PatientService } from './patient.service';

@Controller('/api/patients')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePatientDto,
  ): Promise<ApiResponse<PatientEntity>> {
    const data = await this.patientService.create(dto);

    return { data };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize: number,
    @Query('search') search: string,
  ): Promise<ApiResponse<PatientEntity[]>> {
    const { data, meta } = await this.patientService.getAll(
      page,
      pageSize,
      search,
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
  ): Promise<ApiResponse<PatientEntity>> {
    const data = await this.patientService.getByMrNumber(mrNumber);

    return { data };
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ): Promise<ApiResponse<PatientEntity>> {
    const data = await this.patientService.update(id, dto);

    return { data };
  }
}
