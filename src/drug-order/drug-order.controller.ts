import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';

import {
  CreateDrugOrderDto,
  CreateDrugOrderResponse,
  DeleteDrugOrderResponse,
} from './domain/model/drug.order.model';
import { DrugOrderService } from './drug-order.service';

@Controller('/api/drug-orders')
export class DrugOrderController {
  constructor(private drugOrderService: DrugOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateDrugOrderDto,
  ): Promise<ApiResponse<CreateDrugOrderResponse>> {
    const res = await this.drugOrderService.create(dto);

    return { data: res };
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<DeleteDrugOrderResponse>> {
    const res = await this.drugOrderService.delete(id);

    return {
      data: res,
    };
  }
}
