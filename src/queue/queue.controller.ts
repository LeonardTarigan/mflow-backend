import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';

import {
  ActiveQueue,
  MainQueueItem,
  UpdateQueueStatusDto,
  UpdateQueueStatusResponse,
} from './domain/model/queue.model';
import { QueueService } from './queue.service';

@Controller('/api/queues')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMainQueue(): Promise<ApiResponse<MainQueueItem[]>> {
    const res = await this.queueService.getMainQueue();

    return res;
  }

  @Get('/pharmacy')
  @HttpCode(HttpStatus.OK)
  async getPharmacyQueue(): Promise<ApiResponse<ActiveQueue>> {
    const res = await this.queueService.getPharmacyQueue();

    return { data: res };
  }

  @Get('/doctor/:doctor_id')
  @HttpCode(HttpStatus.OK)
  async getActiveDoctorQueue(
    @Param('doctor_id', ParseUUIDPipe) doctorId: string,
  ): Promise<ApiResponse<ActiveQueue>> {
    const res = await this.queueService.getDoctorQueue(doctorId);

    return { data: res };
  }

  @Patch('/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQueueStatusDto,
  ): Promise<ApiResponse<UpdateQueueStatusResponse>> {
    const res = await this.queueService.updateStatus(id, dto);

    return {
      data: res,
    };
  }
}
