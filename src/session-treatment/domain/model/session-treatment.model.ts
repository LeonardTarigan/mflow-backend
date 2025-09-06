import { OmitType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class SessionTreatmentEntity {
  @IsInt()
  @IsNotEmpty()
  care_session_id: number;

  @IsInt()
  @IsNotEmpty()
  treatment_id: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  applied_price: number;
}

export class CreateSessionTreatmentDto extends OmitType(
  SessionTreatmentEntity,
  ['applied_price'] as const,
) {}

export class CreateSessionTreatmentResponse extends SessionTreatmentEntity {}
