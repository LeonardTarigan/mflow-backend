import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { GenerateMedicalCardDto } from './message.model';
import { MessageService } from './message.service';

@Controller('/api/messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

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
    const buffer = await this.messageService.generateMedicalCardBuffer(dto);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="medical-card-preview.pdf"',
    );
    res.send(buffer);
  }
}
