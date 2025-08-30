import { Module } from '@nestjs/common';

import { FileGenerationService } from './domain/file-generation/file-generation.service';
import { WhatsAppService } from './domain/whatsapp/whatsapp.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, FileGenerationService, WhatsAppService],
})
export class MessageModule {}
