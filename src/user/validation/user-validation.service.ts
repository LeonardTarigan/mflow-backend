// src/user/validation/user-validator.service.ts
import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ValidationService } from 'src/common/validation.service';
import { z, ZodType } from 'zod';

import { CreateUserDto, UpdateUserDto } from '../user.model';

@Injectable()
export class UserValidationService {
  constructor(private readonly validationService: ValidationService) {}

  private readonly CREATE_DTO_SCHEMA: ZodType = z.object({
    username: z
      .string({ message: 'Username tidak boleh kosong' })
      .min(1, 'Username tidak boleh kosong')
      .max(100),
    email: z
      .string({ message: 'Email tidak boleh kosong' })
      .email({ message: 'Format email invalid' }),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]),
  });

  private readonly UPDATE_DTO_SCHEMA: ZodType = z.object({
    username: z
      .string({ message: 'Username tidak boleh kosong' })
      .min(1, 'Username tidak boleh kosong')
      .max(100)
      .optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  });

  validateCreateDto(input: CreateUserDto): CreateUserDto {
    return this.validationService.validate<CreateUserDto>(
      this.CREATE_DTO_SCHEMA,
      input,
    );
  }

  validateUpdateDto(input: UpdateUserDto): UpdateUserDto {
    return this.validationService.validate(this.UPDATE_DTO_SCHEMA, input);
  }
}
