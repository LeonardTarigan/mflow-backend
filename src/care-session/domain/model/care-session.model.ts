import { OmitType, PartialType } from '@nestjs/mapped-types';
import { QueueStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ResponseMeta } from 'src/common/api.model';
import { DiagnosisEntity } from 'src/diagnosis/domain/model/diagnosis.model';
import { DrugOrderItem } from 'src/drug-order/domain/model/drug.order.model';
import { PatientEntity } from 'src/patient/domain/model/patient.model';
import { RoomEntity } from 'src/room/domain/model/room.model';
import { TreatmentEntity } from 'src/treatment/domain/model/treatment.model';
import { UserEntity } from 'src/user/domain/model/user.schema';
import { VitalSignEntity } from 'src/vital-sign/vital-sign.model';

export type QueueStatusFilter = 'ACTIVE' | QueueStatus;

export class CareSessionEntity {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsEnum(QueueStatus)
  @IsNotEmpty()
  status: QueueStatus;

  @IsString()
  @IsNotEmpty()
  complaints: string;

  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @IsUUID()
  @IsNotEmpty()
  doctor_id: string;

  @IsInt()
  @IsNotEmpty()
  room_id: number;

  @IsString()
  @Matches(/^U\d{3}$/, {
    message: 'Queue number must be in the format Uxxx (e.g., U124',
  })
  queue_number: string;
}

export class CareSessionDetail extends OmitType(CareSessionEntity, [
  'patient_id',
  'doctor_id',
  'room_id',
]) {
  patient: Pick<PatientEntity, 'id' | 'name' | 'medical_record_number'>;
  doctor: Pick<UserEntity, 'id' | 'username'>;
  room: RoomEntity;
  vital_sign: VitalSignEntity | null;
  diagnoses: DiagnosisEntity[];
  drug_orders: DrugOrderItem[];
  treatments: TreatmentEntity[];
}

export class CreateCareSessionDto extends OmitType(CareSessionEntity, ['id']) {}
export class UpdateCareSessionDto extends PartialType(
  OmitType(CareSessionEntity, ['id', 'patient_id', 'doctor_id', 'room_id']),
) {}

export class CreateCareSessionResponse extends CareSessionEntity {}
export class UpdateCareSessionResponse extends CareSessionEntity {}

export class GetAllCareSessionsResponse {
  data: CareSessionDetail[];
  meta: ResponseMeta;
}
