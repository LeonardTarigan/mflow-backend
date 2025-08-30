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

export class GenerateMedicalCardDto {
  @IsString()
  @Matches(/^\d{2}\.\d{2}\.\d{2}$/, {
    message: 'Medical record number must be in the format XX.XX.XX',
  })
  medical_record_number: string;
}

export class InvoiceItem {
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

export class GenerateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  session_date: string;

  @IsString()
  @IsNotEmpty()
  patient_name: string;

  @IsString()
  @IsNotEmpty()
  doctor_name: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItem)
  treatment_list: InvoiceItem[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItem)
  drug_order_list: InvoiceItem[];
}
