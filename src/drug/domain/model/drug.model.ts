import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ResponseMeta } from 'src/common/api.model';

export class DrugEntity {
  @IsInt()
  @IsPositive()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock: number;

  @IsInt()
  @Min(0)
  amount_sold: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateDrugDto extends OmitType(DrugEntity, [
  'id',
  'amount_sold',
]) {}

export class UpdateDrugDto extends PartialType(CreateDrugDto) {
  @IsInt()
  @Min(0)
  @IsOptional()
  amount_sold?: number;
}

export class CreateDrugResponse extends DrugEntity {}
export class UpdateDrugResponse extends DrugEntity {}
export class GetDrugByIdResponse extends DrugEntity {}

export class GetAllDrugsResponse {
  data: DrugEntity[];
  meta: ResponseMeta;
}
