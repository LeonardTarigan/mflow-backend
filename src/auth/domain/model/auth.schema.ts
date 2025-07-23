// src/modules/auth/domain/schemas/auth.schema.ts

import { UserResponseSchema } from 'src/user/domain/model/user.schema';
import { z } from 'zod';

export const AuthLoginSchema = z.object({
  email: z
    .string({ message: 'Email tidak boleh kosong' })
    .email('Format email invalid!'),
  password: z
    .string({ message: 'Password tidak boleh kosong' })
    .min(1, 'Password tidak boleh kosong'),
});

export const AuthLoginResponseSchema = z.object({
  user: UserResponseSchema,
  token: z.string(),
});
