import { Gender } from '@prisma/client';

class BasePatient {
  medical_record_number?: string;
  name: string;
  birth_date: Date;
  address: string;
  nik: string;
  occupation: string;
  phone_number: string;
  email?: string;
  gender: Gender;
}

export class PatientDetail extends BasePatient {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export class AddPatientDto extends BasePatient {}
export class AddPatientResponse extends PatientDetail {}
