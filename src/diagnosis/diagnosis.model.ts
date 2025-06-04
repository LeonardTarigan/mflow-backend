class Diagnosis {
  id: number;
  name: string;
}

export class AddDiagnosisDto {
  name: string;
}

export class AddDiagnosisResponse extends Diagnosis {}
