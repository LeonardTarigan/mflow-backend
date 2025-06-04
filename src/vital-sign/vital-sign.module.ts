import { Module } from '@nestjs/common';
import { VitalSignController } from './vital-sign.controller';
import { VitalSignService } from './vital-sign.service';

@Module({
  controllers: [VitalSignController],
  providers: [VitalSignService],
})
export class VitalSignModule {}
