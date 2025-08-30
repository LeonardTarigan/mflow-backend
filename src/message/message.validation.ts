import { z, ZodType } from 'zod';

export class MessageValidation {
  static readonly GENERATE_MEDICAL_CARD: ZodType = z.object({
    medical_record_number: z.string().min(1),
  });
}
