import { z, ZodType } from 'zod';

export class VitalSignValidation {
  static readonly ADD: ZodType = z.object({
    care_session_id: z.number().int().positive(),
    height_cm: z.number().positive(),
    weight_kg: z.number().positive(),
    body_temperature_c: z.number(),
    blood_pressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, {
      message:
        'Blood pressure must be in the format [systolic]/[dystolic] (e.g., 120/80)',
    }),
    heart_rate_bpm: z.number().positive(),
    respiratory_rate_bpm: z.number().positive(),
  });
}
