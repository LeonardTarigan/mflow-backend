import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Gender } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ResponseMeta } from 'src/common/api.model';

export class PatientEntity {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @Matches(/^\d{2}\.\d{2}\.\d{2}$/, {
    message: 'Medical record number must be in the format XX.XX.XX',
  })
  medical_record_number?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  birth_date: Date;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Length(16, 16, { message: 'NIK must be exactly 16 characters' })
  nik: string;

  @IsString()
  @IsNotEmpty()
  occupation: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+628[0-9]{7,12}$/, {
    message:
      'Phone number must be a valid Indonesian format (e.g., +6281234567890)',
  })
  phone_number: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(Gender)
  gender: Gender;
}

export class CreatePatientDto extends OmitType(PatientEntity, [
  'id',
  'medical_record_number',
]) {}
export class UpdatePatientDto extends PartialType(CreatePatientDto) {}

export class GetAllPatientsResponse {
  data: PatientEntity[];
  meta: ResponseMeta;
}
