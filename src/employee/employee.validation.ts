import { EmployeeRole } from '@prisma/client';
import { z, ZodType } from 'zod';

export class EmployeeValidation {
  static readonly ADD: ZodType = z.object({
    id: z.string().min(1).max(100),
    nip: z.string().min(1).max(100),
    name: z.string().min(1).max(100),
    email: z.string().min(1).max(100),
    phone: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
    role: z.enum(Object.values(EmployeeRole) as [string, ...string[]]),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().min(1).max(100).optional(),
    phone: z.string().min(1).max(100).optional(),
    role: z
      .enum(Object.values(EmployeeRole) as [string, ...string[]])
      .optional(),
  });
}
