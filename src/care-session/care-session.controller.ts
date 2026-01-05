import {
  Body,
  Controller,
  DefaultValuePipe,
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

import { CareSessionService } from './care-session.service';
import {
  CareSessionDetail,
  CreateCareSessionDto,
  CreateCareSessionResponse,
  QueueStatusFilter,
  UpdateCareSessionDto,
  UpdateCareSessionResponse,
} from './domain/model/care-session.model';

@Controller('/api/care-sessions')
export class CareSessionController {
  constructor(private careSessionService: CareSessionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCareSessionDto,
  ): Promise<ApiResponse<CreateCareSessionResponse>> {
    const res = await this.careSessionService.create(dto);

    return { data: res };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize: number,
    @Query('roomId', new ParseIntPipe({ optional: true })) roomId: number,
    @Query('search') search: string,
    @Query('status') status: QueueStatusFilter,
    @Query('doctorId') doctorId: string,
    @Query('dateRange') dateRange: string,
  ): Promise<ApiResponse<CareSessionDetail[]>> {
    const { data, meta } = await this.careSessionService.getAll(
      page,
      pageSize,
      search,
      status,
      roomId,
      doctorId,
      dateRange,
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
    @Body() dto: UpdateCareSessionDto,
  ): Promise<ApiResponse<UpdateCareSessionResponse>> {
    const res = await this.careSessionService.update(id, dto);

    return {
      data: res,
    };
  }
}
