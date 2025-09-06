import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ResponseMeta } from 'src/common/api.model';

export class TreatmentEntity {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateTreatmentDto extends OmitType(TreatmentEntity, ['id']) {}
export class UpdateTreatmentDto extends PartialType(
  OmitType(TreatmentEntity, ['id']),
) {}

export class CreateTreatmentResponse extends TreatmentEntity {}
export class UpdateTreatmentResponse extends TreatmentEntity {}
export class GetTreatmentByIdResponse extends TreatmentEntity {}
export class GetAllTreatmentsResponse {
  data: TreatmentEntity[];
  meta: ResponseMeta;
}
