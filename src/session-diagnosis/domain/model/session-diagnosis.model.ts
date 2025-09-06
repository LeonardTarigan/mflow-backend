import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SessionDiagnosisEntity {
  @IsInt()
  @IsNotEmpty()
  care_session_id: number;

  @IsString()
  @IsNotEmpty()
  diagnosis_id: string;
}

export class CreateSessionDiagnosisDto extends SessionDiagnosisEntity {
  @IsString()
  @IsNotEmpty()
  diagnosis_name: string;
}

export class CreateSessionDiagnosisResponse extends SessionDiagnosisEntity {}
