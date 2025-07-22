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
import { ApiResponse } from 'src/common/api.model';

import {
  CreateUserDto,
  CreateUserResponse,
  UpdateUserDto,
  UserResponseDto,
} from './user.model';
import { UserService } from './user.service';

@Controller('/api/users')
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page') page: string,
    @Query('search') search: string,
    @Query('pageSize') pageSize: string,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const { data, meta } = await this.service.getAll(page, search, pageSize);

    return {
      data,
      meta,
    };
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Param('id') id: string,
  ): Promise<ApiResponse<UserResponseDto>> {
    const res = await this.service.getById(id);

    return {
      data: res,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body() dto: CreateUserDto,
  ): Promise<ApiResponse<CreateUserResponse>> {
    const res = await this.service.create(dto);

    return {
      data: res,
    };
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const res = await this.service.update(id, dto);

    return {
      data: res,
    };
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<ApiResponse<string>> {
    const res = await this.service.delete(id);

    return {
      data: res,
    };
  }
}
