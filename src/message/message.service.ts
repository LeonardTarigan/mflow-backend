import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { FileGenerationService } from './domain/file-generation/file-generation.service';
import { GenerateMedicalCardDto } from './domain/model/message.model';
import { WhatsAppService } from './domain/whatsapp/whatsapp.service';

@Injectable()
export class MessageService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private fileGenerationService: FileGenerationService,
    private whatsappService: WhatsAppService,
  ) {}

  async sendMedicalCardMessage(dto: GenerateMedicalCardDto): Promise<void> {
    const { buffer, patient } =
      await this.fileGenerationService.generateMedicalCardPdf(dto);
    const filename = `Kartu Berobat - ${patient.name}.pdf`;

    const mediaId = await this.whatsappService.uploadMedia(buffer, filename);

    await Promise.all([
      this.whatsappService.sendDocument(
        patient.phone_number,
        mediaId,
        filename,
      ),
      this.whatsappService.sendTemplate(
        patient.phone_number,
        'mflow_medical_card',
      ),
    ]);
  }
}
