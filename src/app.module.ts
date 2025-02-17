import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { EmployeeModule } from './employee/employee.module';
import { DrugModule } from './drug/drug.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [CommonModule, AuthModule, EmployeeModule, DrugModule, RoomModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
