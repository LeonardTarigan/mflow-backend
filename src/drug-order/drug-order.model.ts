class BaseDrugOrder {
  care_session_id: number;
  drug_id: number;
  quantity: number;
}

export class DrugOrderDetail extends BaseDrugOrder {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export class AddDrugOrderDto extends BaseDrugOrder {}
export class AddDrugOrderResponse extends DrugOrderDetail {}

export class GetDrugOrderByIdResponse extends DrugOrderDetail {}
