import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { AddRoomDto, AddRoomResponse, UpdateRoomDto } from './room.model';
import { ApiResponse } from 'src/common/api.model';
import { Room } from '@prisma/client';

@Controller('/api/rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async add(@Body() dto: AddRoomDto): Promise<ApiResponse<AddRoomResponse>> {
    const res = await this.roomService.add(dto);

    return { data: res };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page') page: string,
    @Query('search') search: string,
    @Query('pageSize') pageSize: string,
  ): Promise<ApiResponse<Room[]>> {
    const parsedPageSize = pageSize ? parseInt(pageSize, 10) : undefined;

    const { data, meta } = await this.roomService.getAll(
      page,
      search,
      parsedPageSize,
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
    @Body() dto: UpdateRoomDto,
  ): Promise<ApiResponse<Room>> {
    const res = await this.roomService.update(id, dto);

    return {
      data: res,
    };
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<ApiResponse<string>> {
    const res = await this.roomService.delete(id);

    return {
      data: res,
    };
  }
}
