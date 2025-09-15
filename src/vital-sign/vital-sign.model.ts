import { Decimal } from '@prisma/client/runtime/library';

export class VitalSignEntity {
  care_session_id: number;
  height_cm: Decimal;
  weight_kg: Decimal;
  body_temperature_c: Decimal;
  blood_pressure: string;
  heart_rate_bpm: number;
  respiratory_rate_bpm: number;
}

export class VitalSignDetail extends VitalSignEntity {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export class AddVitalSignDto extends VitalSignEntity {}
export class AddVitalSignResponse extends VitalSignDetail {}

export class GetVitalSignByIdResponse extends VitalSignDetail {}
