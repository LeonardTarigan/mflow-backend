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
  AddUserDto,
  AddUserResponse,
  UpdateUserDto,
  UserDetail,
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
  ): Promise<ApiResponse<UserDetail[]>> {
    const parsedPageSize = pageSize ? parseInt(pageSize, 10) : undefined;

    const { data, meta } = await this.service.getAll(
      page,
      search,
      parsedPageSize,
    );

    return {
      data,
      meta,
    };
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string): Promise<ApiResponse<UserDetail>> {
    const res = await this.service.getById(id);

    return {
      data: res,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(@Body() dto: AddUserDto): Promise<ApiResponse<AddUserResponse>> {
    const res = await this.service.add(dto);

    return {
      data: res,
    };
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiResponse<UserDetail>> {
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
