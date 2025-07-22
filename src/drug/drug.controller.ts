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
import { ApiResponse } from 'src/common/api.model';

import {
  AddDrugDto,
  AddDrugResponse,
  DrugDetail,
  UpdateDrugDto,
} from './drug.model';
import { DrugService } from './drug.service';

@Controller('/api/drugs')
export class DrugController {
  constructor(private drugService: DrugService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(@Body() dto: AddDrugDto): Promise<ApiResponse<AddDrugResponse>> {
    const res = await this.drugService.add(dto);

    return { data: res };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page') page: string,
    @Query('search') search: string,
    @Query('pageSize') pageSize: string,
  ): Promise<ApiResponse<DrugDetail[]>> {
    const parsedPageSize = pageSize ? parseInt(pageSize, 10) : undefined;

    const { data, meta } = await this.drugService.getAll(
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
    @Body() dto: UpdateDrugDto,
  ): Promise<ApiResponse<DrugDetail>> {
    const res = await this.drugService.update(id, dto);

    return {
      data: res,
    };
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<ApiResponse<string>> {
    const res = await this.drugService.delete(id);

    return {
      data: res,
    };
  }
}
