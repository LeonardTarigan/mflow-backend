import {
  Body,
  Controller,
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
  @HttpCode(HttpStatus.OK)
  async add(@Body() dto: AddDrugDto): Promise<ApiResponse<AddDrugResponse>> {
    const res = await this.drugService.add(dto);

    return { data: res };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page') page: string,
    @Query('search') search: string,
  ): Promise<ApiResponse<DrugDetail[]>> {
    const { data, meta } = await this.drugService.getAll(page, search);

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
}
