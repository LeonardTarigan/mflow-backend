import { ResponseMeta } from 'src/common/api.model';

export class Treatment {
  id: number;
  name: string;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export class AddTreatmentDto {
  name: string;
  price: number;
}

export class AddTreatmentResponse extends Treatment {}

export class GetAllTreatmentsResponse {
  data: Treatment[];
  meta: ResponseMeta;
}

export class UpdateTreatmentDto {
  name?: string;
  price?: number;
}
