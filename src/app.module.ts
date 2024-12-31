import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [CommonModule, AuthModule, EmployeeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
