// src/modules/user/domain/schemas/user.schema.ts

import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  password: z.string(),
});

export const CreateUserSchema = UserSchema.omit({ id: true, password: true });

export const UpdateUserSchema = UserSchema.pick({
  username: true,
  role: true,
}).partial();

export const UserResponseSchema = UserSchema.omit({ password: true });

export type UserEntity = z.infer<typeof UserSchema>;
