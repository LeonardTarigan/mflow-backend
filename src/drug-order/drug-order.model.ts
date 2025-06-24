class BaseDrugOrder {
  care_session_id: number;
  drug_id: number;
  quantity: number;
  dose: string;
}

export class DrugOrderDetail extends BaseDrugOrder {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export class AddDrugOrderDto {
  care_session_id: number;
  drugs: Omit<BaseDrugOrder, 'care_session_id'>[];
}

export class AddDrugOrderResponse extends BaseDrugOrder {}

export class GetDrugOrderByIdResponse extends DrugOrderDetail {}
