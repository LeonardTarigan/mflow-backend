import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { PatientEntity } from 'src/patient/domain/model/patient.model';

export class GenerateMedicalCardDto {
  @IsString()
  @Matches(/^\d{2}\.\d{2}\.\d{2}$/, {
    message: 'Medical record number must be in the format XX.XX.XX',
  })
  medical_record_number: string;
}

export class GenerateMedicalCardResponse {
  buffer: Buffer;
  patient: PatientEntity;
}

export class ReceiptItem {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsInt()
  @IsPositive()
  price: number;
}

export class GenerateReceiptDto {
  @IsString()
  @IsNotEmpty()
  transaction_date: string;

  @IsString()
  @Matches(/^\d{2}\.\d{2}\.\d{2}$/, {
    message: 'Medical record number must be in the format XX.XX.XX',
  })
  medical_record_number: string;

  @IsString()
  @IsNotEmpty()
  patient_name: string;

  @IsString()
  @IsNotEmpty()
  doctor_name: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItem)
  treatment_list: ReceiptItem[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItem)
  drug_order_list: ReceiptItem[];

  @IsInt()
  @IsNotEmpty()
  total_amount: number;
}

export class GenerateReceiptResponse {
  buffer: Buffer;
  patient_name: string;
  phone_number: string;
}

export class ReceiptDocumentProps extends OmitType(GenerateReceiptDto, [
  'phone_number',
]) {
  printed_date: string;
}
