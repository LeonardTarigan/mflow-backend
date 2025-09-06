import { OmitType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class DrugOrderEntity {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  care_session_id: number;

  @IsNumber()
  @IsNotEmpty()
  drug_id: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  dose: string;
}

export class CreateDrugOrderDto extends OmitType(DrugOrderEntity, ['id']) {}

export class CreateDrugOrderResponse extends DrugOrderEntity {}
