import { z, ZodType } from 'zod';

export class DiagnosisValidation {
  static readonly ADD: ZodType = z.object({
    name: z.string({ message: 'Nama tidak boleh kosong' }).min(1).max(100),
  });

  static readonly ADD_SESSION_DIAGNOSIS: ZodType = z.object({
    care_session_id: z.number().int().positive(),
    diagnosis_ids: z
      .array(z.string())
      .min(1, { message: 'Diagnosis harus diisi minimal satu' }),
  });
}
