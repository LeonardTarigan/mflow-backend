import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
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
  CreateTreatmentDto,
  TreatmentEntity,
  UpdateTreatmentDto,
} from './domain/model/treatment.model';
import { TreatmentService } from './treatment.service';

@Controller('/api/treatments')
export class TreatmentController {
  constructor(private treatmentService: TreatmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTreatmentDto,
  ): Promise<ApiResponse<CreateTreatmentDto>> {
    const res = await this.treatmentService.create(dto);

    return { data: res };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize: number,
    @Query('search') search: string,
  ): Promise<ApiResponse<TreatmentEntity[]>> {
    const { data, meta } = await this.treatmentService.getAll(
      page,
      pageSize,
      search,
    );

    return {
      data,
      meta,
    };
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTreatmentDto,
  ): Promise<ApiResponse<TreatmentEntity>> {
    const res = await this.treatmentService.update(id, dto);

    return {
      data: res,
    };
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<string>> {
    const res = await this.treatmentService.delete(id);

    return {
      data: res,
    };
  }
}
