import { Gender } from '@prisma/client';
import { z, ZodType } from 'zod';

export class MessageValidation {
  static readonly GENERATE_MEDICAL_CARD: ZodType = z.object({
    phone_number: z.string().min(1).max(100),
    medical_record_number: z.string().min(1),
    name: z.string().min(1),
    gender: z.enum(Object.values(Gender) as [string, ...string[]]),
  });
}
