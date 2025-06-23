import { Gender, QueueStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ResponseMeta } from 'src/common/api.model';
import { PatientDetail } from 'src/patient/patient.model';

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
  queue_number: string;
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
  patient: Pick<PatientDetail, 'id' | 'name' | 'medical_record_number'>;
  doctor: { id: string; username: string };
  room: { id: number; name: string };
  vital_sign?: {
    height_cm: Decimal;
    weight_kg: Decimal;
    body_temperature_c: Decimal;
    blood_pressure: string;
    heart_rate_bpm: number;
    respiratory_rate_bpm: number;
  };
  diagnoses?: { id: string; name: string }[];
  drug_orders?: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
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

export class CurrentPharmacyQueueDetail {
  id: number;
  queue_number: string;
  complaints: string;
  doctor: { id: string; username: string };
  patient: { id: string; name: string; birth_date: Date; gender: Gender };
  diagnoses: { id: string; name: string }[];
  drug_orders: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    dose: string;
  }[];
}
export class GetActivePharmacyQueueResponse {
  current: CurrentPharmacyQueueDetail;
  next_queues: { id: number; queue_number: string }[];
}

export class CurrentDoctorQueueDetail {
  id: number;
  queue_number: string;
  complaints: string;
  doctor: { id: string; username: string };
  patient: {
    id: string;
    name: string;
    birth_date: Date;
    gender: Gender;
    occupation: string;
  };
}

export class GetActiveDoctorQueueResponse {
  current: CurrentDoctorQueueDetail;
  next_queues: { id: number; queue_number: string }[];
}

export class WaitingQueueDetail {
  id: number;
  queue_number: string;
  doctor: {
    id: string;
    username: string;
  };
  room: { id: number; name: string };
}

export class CalledQueue {
  id: number;
  queue_number: string;
}
