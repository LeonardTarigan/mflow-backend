import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { DrugOrderModule } from './drug-order/drug-order.module';
import { DrugModule } from './drug/drug.module';
import { MessageModule } from './message/message.module';
import { PatientModule } from './patient/patient.module';
import { QueueModule } from './queue/queue.module';
import { RoomModule } from './room/room.module';
import { TreatmentModule } from './treatment/treatment.module';
import { UserModule } from './user/user.module';
import { VitalSignModule } from './vital-sign/vital-sign.module';

import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    DrugModule,
    RoomModule,
    UserModule,
    QueueModule,
    PatientModule,
    VitalSignModule,
    DiagnosisModule,
    DrugOrderModule,
    TreatmentModule,
    MessageModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
