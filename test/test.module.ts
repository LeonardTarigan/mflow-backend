import { Module } from '@nestjs/common';
import { AuthTestService } from './modules/auth/auth.spec.service';

@Module({
  providers: [AuthTestService],
})
export class TestModule {}
