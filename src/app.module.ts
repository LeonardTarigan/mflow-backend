import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { DrugModule } from './drug/drug.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { QueueModule } from './queue/queue.module';
import { PatientModule } from './patient/patient.module';
import { VitalSignModule } from './vital-sign/vital-sign.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
