import { z, ZodType } from 'zod';

export class EmployeeValidation {
  static readonly ADD: ZodType = z.object({
    id: z.string().min(1).max(100),
    nip: z.string().min(1).max(100),
    name: z.string().min(1).max(100),
    email: z.string().min(1).max(100),
    phone: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
    role: z.string().min(1).max(100),
  });
}
