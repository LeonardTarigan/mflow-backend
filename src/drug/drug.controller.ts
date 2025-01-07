import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AddDrugDto, AddDrugResponse } from './drug.model';
import { ApiResponse } from 'src/common/api.model';
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
}
