import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';
import {
  AddEmployeeDto,
  AddEmployeeResponse,
  EmployeeDetail,
} from 'src/employee/employee.model';
import { EmployeeService } from './employee.service';

@Controller('/api/employees')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('page') page: string,
  ): Promise<ApiResponse<EmployeeDetail[]>> {
    const { data, meta } = await this.employeeService.getAll(page);

    return {
      data,
      meta,
    };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async add(
    @Body() dto: AddEmployeeDto,
  ): Promise<ApiResponse<AddEmployeeResponse>> {
    const result = await this.employeeService.add(dto);

    return {
      data: result,
    };
  }
}
