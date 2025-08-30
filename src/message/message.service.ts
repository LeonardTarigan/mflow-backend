import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';

import { GenerateMedicalCardDto } from './message.model';
import { MessageValidation } from './message.validation';

@Injectable()
export class MessageService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private prismaService: PrismaService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  private PdfPrinter = require('pdfmake');

  private WHATSAPP_API_BASE_URL = process.env.WHATSAPP_API_BASE_URL;

  private fonts = {
    Figtree: {
      normal: 'fonts/Figtree-Regular.ttf',
      bold: 'fonts/Figtree-Bold.ttf',
    },
    FigtreeBlack: {
      normal: 'fonts/Figtree-ExtraBold.ttf',
      bold: 'fonts/Figtree-ExtraBold.ttf',
    },
  };

  private printer = new this.PdfPrinter(this.fonts);

  async uploadToWhatsapp(buffer: Buffer): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], {
      type: 'application/pdf',
    });
    formData.append('file', blob, 'mr-card.pdf');
    formData.append('type', 'application/pdf');
    formData.append('messaging_product', 'whatsapp');

    const res = await fetch(`${this.WHATSAPP_API_BASE_URL}/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!data.id) throw new Error('Failed to upload media to WhatsApp');
    return data.id;
  }

  async generateMedicalCardBuffer(
    dto: GenerateMedicalCardDto,
  ): Promise<Buffer> {
    this.validationService.validate<GenerateMedicalCardDto>(
      MessageValidation.GENERATE_MEDICAL_CARD,
      dto,
    );

    const patient = await this.prismaService.patient.findUnique({
      where: { medical_record_number: dto.medical_record_number },
    });

    if (!patient) {
      throw new HttpException(
        'Data pasien tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }

    const docDefinition: TDocumentDefinitions = {
      pageSize: { width: 759, height: 479 },
      pageMargins: 50,
      content: [
        {
          image: 'bg',
          width: 400,
          height: 479,
          absolutePosition: { x: 359 },
        },
        {
          image: 'logo',
          width: 175.5,
          height: 36,
          margin: [30, 30, 0, 0],
        },
        {
          stack: [
            {
              text: 'Kartu Berobat',
              fontSize: 28,
              bold: true,
              color: '#222',
              margin: [0, 30, 0, 0],
            },
            {
              text: dto.medical_record_number || '',
              fontSize: 24,
              color: '#696A6E',
              margin: [0, 10, 0, 0],
            },
          ],
          margin: [30, 40, 0, 0],
        },
        {
          columns: [
            {
              width: 10,
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 70,
                  lineWidth: 4,
                  lineColor: '#990100',
                },
              ],
              margin: [30, 20, 0, 0],
            },
            {
              width: '*',
              table: {
                widths: [80, 10, '*'],
                body: [
                  ['Nama', ':', patient.name],
                  [
                    'Kelamin',
                    ':',
                    patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan',
                  ],
                  ['No. HP', ':', patient.phone_number],
                ],
              },
              layout: 'noBorders',
              fontSize: 19.5,
              color: '#696A6E',
              margin: [0, 14, 0, 0],
            },
          ],
          columnGap: 40,
          marginTop: 40,
        },
      ],
      images: {
        logo: `${process.cwd()}/images/brand-logo.png`,
        bg: `${process.cwd()}/images/medical-card-bg.png`,
      },
      defaultStyle: {
        font: 'Figtree',
      },
    };

    try {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      return new Promise((resolve, reject) => {
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);
        pdfDoc.end();
      });
    } catch (error) {
      console.error(error);
    }
  }

  async sendMedicalCardMessage(dto: GenerateMedicalCardDto): Promise<void> {
    try {
      const buffer = await this.generateMedicalCardBuffer(dto);
      const mediaId = await this.uploadToWhatsapp(buffer);

      const patient = await this.prismaService.patient.findUnique({
        where: { medical_record_number: dto.medical_record_number },
      });

      if (!patient) {
        throw new HttpException(
          'Data pasien tidak ditemukan',
          HttpStatus.NOT_FOUND,
        );
      }

      const docPromise = fetch(`${this.WHATSAPP_API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: patient.phone_number,
          type: 'document',
          document: {
            id: mediaId,
            filename: `Kartu Berobat - ${patient.name}.pdf`,
          },
        }),
      });

      const textPromise = fetch(`${this.WHATSAPP_API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: '6281377471625',
          type: 'template',
          template: {
            name: 'mflow_medical_card',
            language: {
              code: 'id',
            },
          },
        }),
      });

      const [docRes, textRes] = await Promise.all([docPromise, textPromise]);
      const [docData, textData] = await Promise.all([
        docRes.json(),
        textRes.json(),
      ]);

      if (docData.error) {
        this.logger.error(
          `WhatsApp document send error: ${JSON.stringify(docData.error)}`,
        );
        throw new HttpException(
          `WhatsApp document send error: ${docData.error.message || docData.error}`,
          500,
        );
      }

      if (textData.error) {
        this.logger.error(
          `WhatsApp template send error: ${JSON.stringify(textData.error)}`,
        );
        throw new Error(
          `WhatsApp template send error: ${textData.error.message || textData.error}`,
        );
      }

      return { ...docData, ...textData };
    } catch (error) {
      this.logger.error(
        `sendMedicalCardMessage error: ${error.message}`,
        error.stack,
      );
      throw new HttpException(error.message, 500);
    }
  }
}
