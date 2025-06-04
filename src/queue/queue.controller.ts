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
  AddQueueDto,
  AddQueueResponse,
  GetAllQueuesDetail,
  UpdateQueueDto,
  UpdateQueueResponse,
} from './queue.model';
import { QueueService } from './queue.service';

@Controller('/api/queues')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(@Body() dto: AddQueueDto): Promise<ApiResponse<AddQueueResponse>> {
    const res = await this.queueService.add(dto);

    return { data: res };
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('isQueueActive') isQueueActive: string,
  ): Promise<ApiResponse<GetAllQueuesDetail[]>> {
    const parsedPageSize = pageSize ? parseInt(pageSize, 10) : undefined;

    const isQueueActiveBool =
      isQueueActive === undefined ? true : isQueueActive === 'true';

    const { data, meta } = await this.queueService.getAll(
      page,
      parsedPageSize,
      isQueueActiveBool,
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
    @Body() dto: UpdateQueueDto,
  ): Promise<ApiResponse<UpdateQueueResponse>> {
    const res = await this.queueService.update(id, dto);

    return {
      data: res,
    };
  }
}
