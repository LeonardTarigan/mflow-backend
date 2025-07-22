import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';

import { AddDrugOrderDto, AddDrugOrderResponse } from './drug-order.model';
import { DrugOrderService } from './drug-order.service';

@Controller('/api/drug-orders')
export class DrugOrderController {
  constructor(private drugOrderService: DrugOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body() dto: AddDrugOrderDto,
  ): Promise<ApiResponse<AddDrugOrderResponse>> {
    const res = await this.drugOrderService.add(dto);

    return { data: res };
  }
}
