import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';
import {
  AddVitalSignDto,
  AddVitalSignResponse,
  GetVitalSignByIdResponse,
} from './vital-sign.model';
import { VitalSignService } from './vital-sign.service';

@Controller('/api/vital-signs')
export class VitalSignController {
  constructor(private vitalSignService: VitalSignService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body() dto: AddVitalSignDto,
  ): Promise<ApiResponse<AddVitalSignResponse>> {
    const res = await this.vitalSignService.add(dto);

    return { data: res };
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Param('id') id: string,
  ): Promise<ApiResponse<GetVitalSignByIdResponse>> {
    const res = await this.vitalSignService.getById(id);

    return {
      data: res,
    };
  }
}
