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
  AddEmployeeDto,
  AddEmployeeResponse,
  EmployeeDetail,
  UpdateEmployeeDto,
} from 'src/employee/employee.model';
import { EmployeeService } from './employee.service';

@Controller('/api/employees')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page') page: string,
    @Query('search') search: string,
  ): Promise<ApiResponse<EmployeeDetail[]>> {
    const { data, meta } = await this.employeeService.getAll(page, search);

    return {
      data,
      meta,
    };
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string): Promise<ApiResponse<EmployeeDetail>> {
    const res = await this.employeeService.getById(id);

    return {
      data: res,
    };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async add(
    @Body() dto: AddEmployeeDto,
  ): Promise<ApiResponse<AddEmployeeResponse>> {
    const res = await this.employeeService.add(dto);

    return {
      data: res,
    };
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<ApiResponse<EmployeeDetail>> {
    const res = await this.employeeService.update(id, dto);

    return {
      data: res,
    };
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<ApiResponse<string>> {
    const res = await this.employeeService.delete(id);

    return {
      data: res,
    };
  }
}
