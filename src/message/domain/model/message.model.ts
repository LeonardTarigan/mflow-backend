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
  session_date: string;

  @IsString()
  @Matches(/^\d{2}\.\d{2}\.\d{2}$/, {
    message: 'Medical record number must be in the format XX.XX.XX',
  })
  medical_record_number: string;

  @IsString()
  @IsNotEmpty()
  doctor_name: string;

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
}
