import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { v4 as uuid } from 'uuid';
import { Logger } from 'winston';
import {
  AddUserDto,
  AddUserRequest,
  AddUserResponse,
  GetAllUserResponse,
  UpdateUserDto,
  UserDetail,
} from './user.model';
import { UserValidation } from './user.validation';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  generatePassword(name: string, role: string): string {
    const roleMap = {
      ADMIN: 'ADM',
      DOKTER: 'DCT',
      FARMASI: 'FRM',
      STAFF: 'STF',
    };

    const roleCode = roleMap[role.toUpperCase()] || 'USR';

    const namePart = name.slice(0, 4).toLowerCase();
    const randomNum = Math.floor(10000 + Math.random() * 90000);

    return `${namePart}.${roleCode}#${randomNum}`;
  }

  async add(dto: AddUserDto): Promise<AddUserResponse> {
    this.logger.info(`UserService.add(${JSON.stringify(dto)})`);

    const generatedPassword = this.generatePassword(dto.username, dto.role);

    const addEmployeeRequest = this.validationService.validate<AddUserRequest>(
      UserValidation.ADD,
      {
        ...dto,
        id: uuid(),
        password: generatedPassword,
      },
    );

    const totalWithSameEmail = await this.prismaService.user.count({
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

    addEmployeeRequest.password = await bcrypt.hash(
      addEmployeeRequest.password,
      10,
    );

    const employee = await this.prismaService.user.create({
      data: addEmployeeRequest,
    });

    try {
      await this.mailerService.sendMail({
        to: employee.email,
        subject: 'Informasi Akun MFlow Anda',
        template: 'user-welcome',
        context: {
          username: employee.username,
          password: generatedPassword,
        },
      });
    } catch (error) {
      this.logger.error(`Mailer error: ${error}`);
    }

    return {
      user: {
        id: employee.id,
        username: employee.username,
        email: employee.email,
        role: employee.role,
      },
      token: employee.token,
    };
  }

  async getAll(
    page: string,
    search?: string,
    pageSize?: number,
  ): Promise<GetAllUserResponse> {
    this.logger.info(`UserService.getAll(page=${page}, search=${search})`);

    let pageNumber = parseInt(page) || 1;

    if (pageNumber == 0)
      throw new HttpException('Invalid page data type', HttpStatus.BAD_REQUEST);

    if (pageNumber < 1) pageNumber = 1;

    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { nip: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    if (!pageSize) {
      const employees = await this.prismaService.user.findMany({
        where: searchFilter,
        orderBy: {
          username: 'asc',
        },
      });

      return {
        data: employees.map(({ id, username, email, role }) => ({
          id,
          username,
          email,
          role,
        })),
        meta: {
          current_page: 1,
          previous_page: null,
          next_page: null,
          total_page: 1,
          total_data: employees.length,
        },
      };
    }

    const offset = (pageNumber - 1) * pageSize;

    const [employees, totalData] = await Promise.all([
      this.prismaService.user.findMany({
        skip: offset,
        take: pageSize,
        where: searchFilter,
        orderBy: {
          username: 'asc',
        },
      }),
      this.prismaService.user.count({
        where: searchFilter,
      }),
    ]);

    const totalPage = Math.ceil(totalData / pageSize);
    const previousPage = pageNumber > 1 ? pageNumber - 1 : null;
    const nextPage = pageNumber < totalPage ? pageNumber + 1 : null;

    return {
      data: employees.map(({ id, username, email, role }) => ({
        id,
        username,
        email,
        role,
      })),
      meta: {
        current_page: pageNumber,
        previous_page: previousPage,
        next_page: nextPage,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async getById(id: string): Promise<UserDetail> {
    this.logger.info(`UserService.getById(${id})`);

    const employeeData = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!employeeData)
      throw new HttpException(
        'Data karyawan tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return {
      id: employeeData.id,
      username: employeeData.username,
      email: employeeData.email,
      role: employeeData.role,
    };
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDetail> {
    this.logger.info(
      `UserService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    const request = this.validationService.validate<UpdateUserDto>(
      UserValidation.UPDATE,
      dto,
    );

    try {
      const employee = await this.prismaService.user.update({
        where: {
          id: id,
        },
        data: request,
      });

      return {
        id: employee.id,
        username: employee.username,
        email: employee.email,
        role: employee.role,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Data karyawan tidak ditemukan!',
          HttpStatus.NOT_FOUND,
        );
      }
      throw error;
    }
  }

  async delete(id: string): Promise<string> {
    this.logger.info(`UserService.delete(${id})`);

    try {
      await this.prismaService.user.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Data akun tidak ditemukan!',
          HttpStatus.NOT_FOUND,
        );
      }
      throw error;
    }

    return `Successfully deleted: ${id}`;
  }
}
