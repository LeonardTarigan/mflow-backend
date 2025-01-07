class BaseDrug {
  name: string;
  unit: string;
  price: number;
}

export class AddDrugDto extends BaseDrug {}

export class AddDrugResponse extends BaseDrug {
  id: number;
  amount_sold: number;
}
