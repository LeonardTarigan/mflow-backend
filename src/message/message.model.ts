import { Gender } from '@prisma/client';

export class GenerateMedicalCardDto {
  medical_record_number: string;
  name: string;
  phone_number: string;
  gender: Gender;
}

export class GenerateInvoiceDto {
  session_date: string;
  patient_name: string;
  doctor_name: string;
  treatment_list: { name: string; quantity: number; price: number }[];
  drug_order_list: { name: string; quantity: number; price: number }[];
}
