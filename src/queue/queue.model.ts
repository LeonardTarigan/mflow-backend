import { Gender, QueueStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ResponseMeta } from 'src/common/api.model';

class PatientData {
  name: string;
  nik: string;
  birth_date: string;
  address: string;
  occupation: string;
  phone_number: string;
  email: string;
  gender: Gender;
}

class BaseQueue {
  id: number;
  status: QueueStatus;
  diagnosis?: string;
  complaints: string;
  created_at: Date;
  updated_at: Date;
}

export class QueueDetail extends BaseQueue {
  doctor_id: string;
  patient_id: string;
  room_id: number;
}

export class AddQueueDto {
  doctor_id: string;
  patient_id?: string;
  room_id: number;
  patient_data?: PatientData;
  complaints: string;
}

export class AddQueueResponse extends QueueDetail {}

export class GetAllQueuesDetail extends BaseQueue {
  patient: { id: string; name: string };
  doctor: { id: string; username: string };
  room: { id: number; name: string };
  vital_signs?: {
    height_cm: Decimal;
    weight_kg: Decimal;
    body_temperature_c: Decimal;
    blood_pressure: string;
    heart_rate_bpm: number;
    respiratory_rate_bpm: number;
  };
  diagnoses?: { id: number; name: string }[];
}

export class GetAllQueuesResponse {
  data: GetAllQueuesDetail[];
  meta: ResponseMeta;
}

export class UpdateQueueDto {
  status?: QueueStatus;
  diagnosis?: string;
}

export class UpdateQueueResponse extends QueueDetail {}
