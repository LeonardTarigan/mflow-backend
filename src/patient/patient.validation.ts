import { Gender } from '@prisma/client';
import { z, ZodType } from 'zod';

export class PatientValidation {
  static readonly ADD: ZodType = z.object({
    name: z.string().min(1).max(100),
    nik: z.string().min(16).max(16),
    birth_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .transform((val) => new Date(val)),
    address: z.string().min(1).max(200),
    occupation: z.string().min(1).max(100),
    phone_number: z.string().min(1).max(15),
    email: z.string().email().optional(),
    gender: z.enum(Object.values(Gender) as [string, ...string[]]),
  });

  static readonly UPDATE: ZodType = z.object({
    medical_record_number: z.string().optional(),
  });
}
