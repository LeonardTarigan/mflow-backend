import { Module } from '@nestjs/common';
import { PatientModule } from 'src/patient/patient.module';

import { FileGenerationService } from './domain/file-generation/file-generation.service';
import { WhatsAppService } from './domain/whatsapp/whatsapp.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [PatientModule],
  exports: [MessageService],
  controllers: [MessageController],
  providers: [MessageService, FileGenerationService, WhatsAppService],
})
export class MessageModule {}
