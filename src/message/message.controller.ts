import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { FileGenerationService } from './domain/file-generation/file-generation.service';
import { GenerateMedicalCardDto } from './domain/model/message.model';
import { MessageService } from './message.service';

@Controller('/api/messages')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private fileGenerationService: FileGenerationService,
  ) {}

  @Post('/medical-cards')
  @HttpCode(HttpStatus.OK)
  async sendMedicalCardMessage(
    @Body() dto: GenerateMedicalCardDto,
  ): Promise<void> {
    await this.messageService.sendMedicalCardMessage(dto);
  }

  @Post('/medical-cards/preview')
  @HttpCode(HttpStatus.OK)
  async previewMedicalCard(
    @Body() dto: GenerateMedicalCardDto,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer } =
      await this.fileGenerationService.generateMedicalCardPdf(dto);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="medical-card-preview.pdf"',
    );
    res.send(buffer);
  }
}
