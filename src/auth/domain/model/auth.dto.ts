// src/modules/auth/domain/dto/auth.dto.ts

import { createZodDto } from 'nestjs-zod/dto';
import { UserResponseSchema } from 'src/user/domain/model/user.schema';

import { AuthLoginSchema, AuthLoginResponseSchema } from './auth.schema';

export class AuthLoginDto extends createZodDto(AuthLoginSchema) {}

export class AuthDataDto extends createZodDto(UserResponseSchema) {}

export class AuthLoginResponse extends createZodDto(AuthLoginResponseSchema) {}
