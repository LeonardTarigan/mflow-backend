import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { DrugOrderService } from './drug-order.service';
import { AddDrugOrderDto, AddDrugOrderResponse } from './drug-order.model';
import { ApiResponse } from 'src/common/api.model';

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
