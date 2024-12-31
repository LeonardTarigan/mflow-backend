import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  AddEmployeeClientRequest,
  AddEmployeeResponse,
  AddEmployeeServiceRequest,
} from 'src/models/employee.model';
import { v4 as uuid } from 'uuid';
import { Logger } from 'winston';
import { EmployeeValidation } from './employee.validation';
import { $Enums, EmployeeRole } from '@prisma/client';
import * as brcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async generateNip(role: EmployeeRole): Promise<string> {
    const roleValues = Object.values($Enums.EmployeeRole);

    const roleIndex = roleValues.indexOf(role);
    if (roleIndex === -1) {
      throw new Error(`Invalid role: ${role}`);
    }

    const roleCode = (roleIndex + 1).toString().padStart(2, '0');

    const year = new Date().getFullYear().toString().slice(-2);

    const sequence =
      (await this.prismaService.employee.count({
        where: { role },
      })) + 1;

    const paddedSequence = sequence.toString().padStart(4, '0');

    return `${year}${roleCode}${paddedSequence}`;
  }

  async addEmployee(
    request: AddEmployeeClientRequest,
  ): Promise<AddEmployeeResponse> {
    this.logger.info(`Add new employee: ${JSON.stringify(request)}`);

    const generatedId = uuid();
    const generatedNip = await this.generateNip(request.role);
    const generatedPassword = 'test';

    const addEmployeeRequest =
      this.validationService.validate<AddEmployeeServiceRequest>(
        EmployeeValidation.ADD,
        {
          ...request,
          id: generatedId,
          nip: generatedNip,
          password: generatedPassword,
        },
      );

    const totalWithSameEmail = await this.prismaService.employee.count({
      where: {
        email: request.email,
      },
    });

    if (totalWithSameEmail != 0) {
      throw new HttpException('Email is already registered!', 400);
    }

    addEmployeeRequest.password = await brcrypt.hash(
      addEmployeeRequest.password,
      10,
    );

    const employee = await this.prismaService.employee.create({
      data: addEmployeeRequest,
    });

    return {
      nip: employee.nip,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      token: employee.token,
    };
  }
}
