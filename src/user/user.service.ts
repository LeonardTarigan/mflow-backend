import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import {
  CreateUserDto,
  CreateUserResponse,
  GetAllUsersResponse,
  UpdateUserDto,
  UserEntity,
  UserResponseDto,
} from './user.model';
import { UserValidation } from './user.validation';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  private removeResponsePassword(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  private generatePassword(name: string, role: string): string {
    const roleMap = {
      ADMIN: 'ADM',
      DOKTER: 'DCT',
      FARMASI: 'FRM',
      STAFF: 'STF',
    };

    const roleCode = roleMap[role.toUpperCase()] || 'USR';

    const cleanedName = name.replace(/^(drg?)\.?\s*/i, '').trim();
    const namePart = cleanedName.slice(0, 4).toLowerCase();
    const randomNum = randomInt(10000, 99999);

    return `${namePart}.${roleCode}#${randomNum}`;
  }

  async create(dto: CreateUserDto): Promise<CreateUserResponse> {
    this.logger.info(`UserService.add(${JSON.stringify(dto)})`);

    const validatedReq = this.validationService.validate<CreateUserDto>(
      UserValidation.ADD,
      dto,
    );

    const generatedPassword = this.generatePassword(dto.username, dto.role);

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    let user: UserEntity;

    try {
      user = await this.prismaService.user.create({
        data: {
          password: hashedPassword,
          ...validatedReq,
        },
      });

      this.eventEmitter.emit('user.created', { user, generatedPassword });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          `Email ${validatedReq.email} sudah terdaftar!`,
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }

    return {
      user: this.removeResponsePassword(user),
    };
  }

  async getAll(
    pageNumber?: string,
    search?: string,
    pageSize?: string,
  ): Promise<GetAllUsersResponse> {
    this.logger.info(
      `UserService.getAll(page=${pageNumber}, search=${search}, pageSize=${pageSize})`,
    );

    let parsedPageNumber = parseInt(pageNumber) || 1;
    const parsedPageSize = parseInt(pageSize) || 10;
    const offset = (parsedPageNumber - 1) * parsedPageSize;

    if (parsedPageNumber < 1) parsedPageNumber = 1;

    const whereClause: Prisma.UserWhereInput = search
      ? {
          OR: [
            {
              username: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const [users, totalData] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        skip: offset,
        take: parsedPageSize,
        where: whereClause,
        orderBy: { username: 'asc' },
        select: { id: true, username: true, email: true, role: true },
      }),
      this.prismaService.user.count({ where: whereClause }),
    ]);

    const totalPage = Math.ceil(totalData / parsedPageSize);
    const previousPage = parsedPageNumber > 1 ? parsedPageNumber - 1 : null;
    const nextPage = parsedPageNumber < totalPage ? parsedPageNumber + 1 : null;

    return {
      data: users,
      meta: {
        current_page: parsedPageNumber,
        previous_page: previousPage,
        next_page: nextPage,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async getById(id: string): Promise<UserResponseDto> {
    this.logger.info(`UserService.getById(${id})`);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user)
      throw new HttpException(
        'Data akun tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return this.removeResponsePassword(user);
  }

  async getFullDataByEmail(email: string): Promise<UserEntity> {
    this.logger.info(`UserService.getByEmail(${email})`);

    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
      },
    });

    if (!user)
      throw new HttpException(
        'Data akun tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.info(
      `UserService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    const validatedReq = this.validationService.validate<UpdateUserDto>(
      UserValidation.UPDATE,
      dto,
    );

    try {
      const user = await this.prismaService.user.update({
        where: {
          id: id,
        },
        data: validatedReq,
      });

      return this.removeResponsePassword(user);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Data akun tidak ditemukan!',
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

      return `Berhasil menghapus akun: ${id}`;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.error(`Prisma Error (${error.code}): `);
        throw new HttpException(
          'Data akun tidak ditemukan!',
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.code === 'P2023') {
        this.logger.error(`Prisma Error (${error.code}): `);
        throw new HttpException(
          'Format user ID invalid!',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }
}
