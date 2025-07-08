export class Diagnosis {
  id: string;
  name: string;
}

export class SessionDiagnosis {
  care_session_id: number;
  diagnosis_id: string;
}

export class GetAllDiagnosesResponse {
  data: Diagnosis[];
}

export class AddDiagnosisDto {
  name: string;
}
export class AddDiagnosisResponse extends Diagnosis {}

export class AddSessionDiagnosisDto extends SessionDiagnosis {
  care_session_id: number;
  diagnosis_ids: string[];
  external_diagnoses?: Diagnosis[];
}
export class AddSessionDiagnosisResponse extends SessionDiagnosis {}
