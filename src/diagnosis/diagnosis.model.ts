class Diagnosis {
  id: string;
  name: string;
}

class SessionDiagnosis {
  care_session_id: number;
  diagnosis_id: string;
}

export class AddDiagnosisDto {
  name: string;
}
export class AddDiagnosisResponse extends Diagnosis {}

export class AddSessionDiagnosisDto extends SessionDiagnosis {}
export class AddSessionDiagnosisResponse extends SessionDiagnosis {}
