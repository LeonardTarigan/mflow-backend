import { IsNotEmpty, IsString } from 'class-validator';

export class DiagnosisEntity {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateDiagnosisDto extends DiagnosisEntity {}

export class CreateDiagnosisResponse extends DiagnosisEntity {}
export class GetDiagnosisByIdResponse extends DiagnosisEntity {}

export class GetAllDiagnosesResponse {
  data: DiagnosisEntity[];
}
