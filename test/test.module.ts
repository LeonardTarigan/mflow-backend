import { Module } from '@nestjs/common';
import { AuthTestService } from './modules/auth/auth.spec.service';
import { DrugTestService } from './modules/drug/drug.spec.service';

@Module({
  providers: [AuthTestService, DrugTestService],
})
export class TestModule {}
