import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TreatmentService } from './treatment.service';
import { AddTreatmentDto, UpdateTreatmentDto } from './treatment.model';
import { ApiResponse } from 'src/common/api.model';
import { Treatment } from '@prisma/client';

@Controller('/api/treatments')
export class TreatmentController {
  constructor(private treatmentService: TreatmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body() dto: AddTreatmentDto,
  ): Promise<ApiResponse<AddTreatmentDto>> {
    const res = await this.treatmentService.add(dto);

    return { data: res };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page') page: string,
    @Query('search') search: string,
    @Query('pageSize') pageSize: string,
  ): Promise<ApiResponse<Treatment[]>> {
    const parsedPageSize = pageSize ? parseInt(pageSize, 10) : undefined;

    const { data, meta } = await this.treatmentService.getAll(
      page,
      search,
      parsedPageSize,
    );

    return {
      data,
      meta,
    };
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTreatmentDto,
  ): Promise<ApiResponse<Treatment>> {
    const res = await this.treatmentService.update(id, dto);

    return {
      data: res,
    };
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<ApiResponse<string>> {
    const res = await this.treatmentService.delete(id);

    return {
      data: res,
    };
  }
}
