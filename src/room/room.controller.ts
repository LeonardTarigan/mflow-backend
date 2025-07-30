import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
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

import {
  CreateRoomDto,
  RoomEntity,
  UpdateRoomDto,
} from './domain/model/room.model';
import { RoomService } from './room.service';

@Controller('/api/rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(@Body() dto: CreateRoomDto): Promise<ApiResponse<RoomEntity>> {
    const data = await this.roomService.create(dto);

    return { data };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize: number,
    @Query('search') search: string,
  ): Promise<ApiResponse<RoomEntity[]>> {
    const { data, meta } = await this.roomService.getAll(
      page,
      pageSize,
      search,
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
    @Body() dto: UpdateRoomDto,
  ): Promise<ApiResponse<RoomEntity>> {
    const data = await this.roomService.update(id, dto);

    return { data };
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<string>> {
    const data = await this.roomService.delete(id);

    return { data };
  }
}
