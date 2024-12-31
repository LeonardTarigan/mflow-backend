import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [CommonModule, AuthModule, EmployeeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
