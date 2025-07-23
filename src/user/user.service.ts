import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcryptjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { Logger } from 'winston';

import { UserEvent } from './event/user.event';
import { UserMapper } from './mapper/user.mapper';
import { PasswordService } from './password/password.service';
import {
  CreateUserDto,
  CreateUserResponse,
  GetAllUsersResponse,
  UpdateUserDto,
  UserEntity,
  UserResponseDto,
} from './user.model';
import { UserRepository } from './user.repository';
import { UserValidationService } from './validation/user-validation.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private eventEmitter: EventEmitter2,
    private validationService: UserValidationService,
    private passwordService: PasswordService,
    private userRepository: UserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<CreateUserResponse> {
    this.logger.info(`UserService.add(${JSON.stringify(dto)})`);

    const validatedReq = this.validationService.validateCreateDto(dto);

    const passwordStrategy = this.passwordService.getStrategy(
      validatedReq.role,
    );

    const generatedPassword = passwordStrategy.generate(validatedReq.username);

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    try {
      const user = await this.userRepository.create({
        password: hashedPassword,
        ...validatedReq,
      });

      this.eventEmitter.emit(UserEvent.Created, { user, generatedPassword });

      return {
        user: UserMapper.toResponseDto(user),
      };
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2002: `Email ${validatedReq.email} sudah terdaftar`,
      });

      throw error;
    }
  }

  async getAll(
    pageNumber: number,
    pageSize: number,
    search?: string,
  ): Promise<GetAllUsersResponse> {
    this.logger.info(
      `UserService.getAll(page=${pageNumber}, search=${search}, pageSize=${pageSize})`,
    );

    if (pageNumber < 1) pageNumber = 1;

    const offset = (pageNumber - 1) * pageSize;

    const [users, totalData] =
      await this.userRepository.findPaginatedWithSearch(
        offset,
        pageSize,
        search,
      );

    const totalPage = Math.ceil(totalData / pageSize);

    return {
      data: users.map((user) => UserMapper.toResponseDto(user)),
      meta: {
        current_page: pageNumber,
        previous_page: pageNumber > 1 ? pageNumber - 1 : null,
        next_page: pageNumber < totalPage ? pageNumber + 1 : null,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async getById(id: string): Promise<UserResponseDto> {
    this.logger.info(`UserService.getById(${id})`);

    const user = await this.userRepository.findById(id);

    if (!user)
      throw new HttpException(
        'Data akun tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return UserMapper.toResponseDto(user);
  }

  async getRawByEmail(email: string): Promise<UserEntity> {
    this.logger.info(`UserService.getByEmail(${email})`);

    const user = await this.userRepository.findRawByEmail(email);

    if (!user)
      throw new HttpException(
        'Data akun tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return UserMapper.toEntity(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.info(
      `UserService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    const validatedReq = this.validationService.validateUpdateDto(dto);

    try {
      const user = await this.userRepository.update(id, validatedReq);

      return UserMapper.toResponseDto(user);
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2023: 'Format user ID invalid!',
        P2025: 'Data akun tidak ditemukan',
      });

      throw error;
    }
  }

  async delete(id: string): Promise<string> {
    this.logger.info(`UserService.delete(${id})`);

    try {
      await this.userRepository.deleteById(id);

      return `Berhasil menghapus akun: ${id}`;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2023: 'Format user ID invalid!',
        P2025: 'Data akun tidak ditemukan',
      });

      throw error;
    }
  }
}
