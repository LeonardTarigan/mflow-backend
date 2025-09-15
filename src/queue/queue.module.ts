import { Module } from '@nestjs/common';
import { CareSessionModule } from 'src/care-session/care-session.module';
import { UserModule } from 'src/user/user.module';

import { QueueGateway } from './domain/gateway/queue.gateway';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';

@Module({
  providers: [QueueService, QueueGateway],
  controllers: [QueueController],
  imports: [CareSessionModule, UserModule],
})
export class QueueModule {}
