import { UserRole } from '@prisma/client';
import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly ADD: ZodType = z.object({
    id: z.string().min(1).max(100),
    username: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(1).max(100),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]),
  });

  static readonly UPDATE: ZodType = z.object({
    username: z.string().min(1).max(100).optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  });
}
