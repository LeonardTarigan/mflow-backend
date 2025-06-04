import { z, ZodType } from 'zod';

export class DiagnosisValidation {
  static readonly ADD: ZodType = z.object({
    name: z.string({ message: 'Nama tidak boleh kosong' }).min(1).max(100),
  });
}
