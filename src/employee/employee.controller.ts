import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';
import {
  AddEmployeeClientRequest,
  AddEmployeeResponse,
} from 'src/employee/employee.model';
import { EmployeeService } from './employee.service';

@Controller('/api/employees')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: AddEmployeeClientRequest,
  ): Promise<ApiResponse<AddEmployeeResponse>> {
    const result = await this.employeeService.addEmployee(request);

    return {
      data: result,
    };
  }
}
