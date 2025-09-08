import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DiagnosisEntity {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class IcdDiagnosis {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  link: string | null;
}

export class CreateDiagnosisDto extends DiagnosisEntity {}

export class CreateDiagnosisResponse extends DiagnosisEntity {}
export class GetDiagnosisByIdResponse extends DiagnosisEntity {}

export class GetAllDiagnosesResponse {
  data: DiagnosisEntity[];
}
