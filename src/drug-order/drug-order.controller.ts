import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';

import {
  CreateDrugOrderDto,
  CreateDrugOrderResponse,
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
}
