import { Module } from '@nestjs/common';

import { QueueController } from './queue.controller';
import { QueueGateway } from './queue.gateway';
import { QueueService } from './queue.service';

@Module({
  providers: [QueueService, QueueGateway],
  controllers: [QueueController],
})
export class QueueModule {}
