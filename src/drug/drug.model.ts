import { PickType, PartialType } from '@nestjs/mapped-types';
import { ResponseMeta } from 'src/common/api.model';

export class DrugEntity {
  id: number;
  name: string;
  unit: string;
  price: number;
  amount_sold: number;
}

export class CreateDrugDto extends PickType(DrugEntity, [
  'name',
  'unit',
  'price',
]) {}

export class UpdateDrugDto extends PartialType(
  PickType(DrugEntity, ['name', 'unit', 'price', 'amount_sold']),
) {}

export class GetAllDrugsResponse {
  data: DrugEntity[];
  meta: ResponseMeta;
}
