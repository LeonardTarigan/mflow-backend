import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { GenerateMedicalCardDto } from './message.model';
import { MessageValidation } from './message.validation';

@Injectable()
export class MessageService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
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
    const blob = new Blob([buffer], { type: 'application/pdf' });
    formData.append('file', blob, 'mr-card.pdf');
    formData.append('type', 'application/pdf');
    formData.append('messaging_product', 'whatsapp');

    const res = await fetch(`${this.WHATSAPP_API_BASE_URL}/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
      body: formData as any,
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

    const docDefinition: TDocumentDefinitions = {
      pageSize: { width: 540, height: 340 },
      pageMargins: [20, 20, 20, 20],
      content: [
        {
          text: 'Klinik Pratama Millenium',
          bold: true,
          fontSize: 16,
          alignment: 'center',
          marginBottom: 3,
          color: '#990100',
        },
        {
          text: 'Jl. Kapten Muslim No.18C, Sei Sikambing C. II, Kec. Medan Helvetia, Kota Medan, Sumatera Utara 20118',
          alignment: 'center',
          fontSize: 10,
          marginBottom: 2,
        },
        {
          text: '+62 813-7747-1625 • klinikmillenium@gmail.com • @millenium_klinik',
          alignment: 'center',
          fontSize: 10,
          marginBottom: 10,
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 500,
              y2: 0,
              lineWidth: 1,
              lineColor: '#000000',
            },
          ],
          marginBottom: 15,
        },
        {
          text: 'KARTU BEROBAT',
          alignment: 'center',
          bold: true,
          fontSize: 20,
          font: 'FigtreeBlack',
          color: '#990100',
        },
        { text: '', margin: [0, 0, 0, 70] },
        {
          columns: [
            {
              table: {
                widths: [60, 10, '*'],
                body: [
                  ['No. MR', ':', dto.medical_record_number],
                  ['Nama', ':', dto.name],
                  [
                    'Kelamin',
                    ':',
                    dto.gender === 'MALE' ? 'Laki-laki' : 'Perempuan',
                  ],
                  ['No. HP', ':', dto.phone_number],
                ],
              },
              layout: 'noBorders',
              fontSize: 14,
              marginTop: 44,
            },
            {
              stack: [
                {
                  qr: dto.medical_record_number,
                },
              ],
              alignment: 'right',
              margin: [0, 20, 0, 0],
            },
          ],
          columnGap: 10,
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
      },
      defaultStyle: {
        font: 'Figtree',
      },
    };
    const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  async sendMedicalCardMessage(dto: GenerateMedicalCardDto) {
    try {
      const buffer = await this.generateMedicalCardBuffer(dto);
      const mediaId = await this.uploadToWhatsapp(buffer);

      const docPromise = fetch(`${this.WHATSAPP_API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: dto.phone_number,
          type: 'document',
          document: {
            id: mediaId,
            filename: 'Kartu Berobat.pdf',
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
