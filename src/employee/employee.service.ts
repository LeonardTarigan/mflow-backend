import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { $Enums, EmployeeRole } from '@prisma/client';
import * as brcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  AddEmployeeDto,
  AddEmployeeRequest,
  AddEmployeeResponse,
} from 'src/employee/employee.model';
import { v4 as uuid } from 'uuid';
import { Logger } from 'winston';
import { EmployeeValidation } from './employee.validation';

@Injectable()
export class EmployeeService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private readonly mailerService: MailerService,
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

  generatePassword(role: EmployeeRole, nip: string): string {
    const roleMap = {
      ADMIN: 'ADM',
      DOKTER: 'DKT',
      PERAWAT: 'PRW',
      BIDAN: 'BDN',
      FARMASI: 'FRM',
      APOTEKER: 'APT',
      STAFF: 'STF',
    };

    const roleCode = roleMap[role].split('').reverse().join('') || 'USR';

    const nipSuffix = nip.slice(-4).split('').reverse().join('');

    const specialChars = ['!', '@', '#', '$', '%', '*', '?'];
    const specialChar =
      specialChars[Math.floor(Math.random() * specialChars.length)];

    return `${roleCode}${nipSuffix}${specialChar}`;
  }

  async addEmployee(dto: AddEmployeeDto): Promise<AddEmployeeResponse> {
    this.logger.info(`Add new employee: ${JSON.stringify(dto)}`);

    const generatedId = uuid();
    const generatedNip = await this.generateNip(dto.role);
    const generatedPassword = this.generatePassword(dto.role, generatedNip);

    const addEmployeeRequest =
      this.validationService.validate<AddEmployeeRequest>(
        EmployeeValidation.ADD,
        {
          ...dto,
          id: generatedId,
          nip: generatedNip,
          password: generatedPassword,
        },
      );

    const totalWithSameEmail = await this.prismaService.employee.count({
      where: {
        email: dto.email,
      },
    });

    if (totalWithSameEmail != 0) {
      throw new HttpException(
        `Email ${dto.email} sudah terdaftar!`,
        HttpStatus.BAD_REQUEST,
      );
    }

    addEmployeeRequest.password = await brcrypt.hash(
      addEmployeeRequest.password,
      10,
    );

    const employee = await this.prismaService.employee.create({
      data: addEmployeeRequest,
    });

    const html = `
      <p>Halo <strong>${employee.name}</strong>,</p>
      <p>Selamat bergabung di tim kami! Berikut adalah detail akun Anda:</p>
      <ul>
        <li><strong>NIP:</strong> ${employee.nip}</li>
        <li><strong>Password:</strong> ${generatedPassword}</li>
      </ul>
      <p>Kalau ada pertanyaan atau butuh bantuan, jangan ragu untuk menghubungi tim IT kami.</p>
      <p>Selamat bekerja dan semoga sukses!</p>
      <br>
      <p>Salam,</p>
      <p><strong>Klinik Pratama Millenium</strong></p>
    `;

    try {
      await this.mailerService.sendMail({
        to: employee.email,
        subject: 'Informasi Akun MFlow Anda',
        html,
      });
    } catch (error) {
      this.logger.error(`Mailer error: ${error}`);
    }

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
