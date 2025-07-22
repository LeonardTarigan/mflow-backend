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

import { CreateDrugDto, DrugEntity, UpdateDrugDto } from './drug.model';
import { DrugService } from './drug.service';

@Controller('/api/drugs')
export class DrugController {
  constructor(private drugService: DrugService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(@Body() dto: CreateDrugDto): Promise<ApiResponse<DrugEntity>> {
    const res = await this.drugService.create(dto);

    return { data: res };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('search') search: string,
  ): Promise<ApiResponse<DrugEntity[]>> {
    const { data, meta } = await this.drugService.getAll(
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
    @Body() dto: UpdateDrugDto,
  ): Promise<ApiResponse<DrugEntity>> {
    const res = await this.drugService.update(id, dto);

    return {
      data: res,
    };
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<string>> {
    const res = await this.drugService.delete(id);

    return {
      data: res,
    };
  }
}
