import { ResponseMeta } from 'src/common/api.model';

class BaseDrug {
  name: string;
  unit: string;
  price: number;
}

export class DrugDetail extends BaseDrug {
  id: number;
  amount_sold: number;
}

export class AddDrugDto extends BaseDrug {}
export class AddDrugResponse extends DrugDetail {}

export class GetAllDrugsResponse {
  data: DrugDetail[];
  meta: ResponseMeta;
}
