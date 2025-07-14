import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { GenerateMedicalCardDto } from './message.model';
import { MessageService } from './message.service';
import { Response } from 'express';

@Controller('/api/messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post('/medical-cards')
  @HttpCode(HttpStatus.OK)
  async sendMedicalCardMessage(@Body() dto: GenerateMedicalCardDto) {
    await this.messageService.sendMedicalCardMessage(dto);
  }

  @Post('/medical-cards/preview')
  @HttpCode(HttpStatus.OK)
  async previewMedicalCard(
    @Body() dto: GenerateMedicalCardDto,
    @Res() res: Response,
  ) {
    const buffer = await this.messageService.generateMedicalCardBuffer(dto);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="medical-card-preview.pdf"',
    );
    res.send(buffer);
  }
}
