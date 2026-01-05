import { Module } from '@nestjs/common';
import { MessageModule } from 'src/message/message.module';

import { CareSessionController } from './care-session.controller';
import { CareSessionService } from './care-session.service';
import { CareSessionRepository } from './infrastucture/care-session.repository';

@Module({
  controllers: [CareSessionController],
  providers: [CareSessionService, CareSessionRepository],
  exports: [CareSessionService],
  imports: [MessageModule],
})
export class CareSessionModule {}
