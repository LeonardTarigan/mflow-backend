import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Patient } from '@prisma/client';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  GenerateMedicalCardDto,
  GenerateReceiptDto,
} from 'src/message/domain/model/message.model';
import { PatientEntity } from 'src/patient/domain/model/patient.model';
import { PatientRepository } from 'src/patient/infrastucture/patient.repository';

@Injectable()
export class FileGenerationService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  private PdfPrinter = require('pdfmake');
  private printer;

  constructor(private readonly patientRepository: PatientRepository) {
    const fonts = {
      Figtree: {
        normal: 'fonts/Figtree-Regular.ttf',
        bold: 'fonts/Figtree-Bold.ttf',
      },
    };

    this.printer = new this.PdfPrinter(fonts);
  }

  async generateMedicalCardPdf(
    dto: GenerateMedicalCardDto,
  ): Promise<{ buffer: Buffer; patient: PatientEntity }> {
    const patient = await this.patientRepository.findByMrNumber(
      dto.medical_record_number,
    );

    if (!patient) {
      throw new HttpException('Patient data not found', HttpStatus.NOT_FOUND);
    }

    const docDefinition = this.getMedicalCardDocDefinition({
      medical_record_number: dto.medical_record_number,
      patient,
    });
    const pdfDoc = this.printer.createPdfKitDocument(docDefinition);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () =>
        resolve({ buffer: Buffer.concat(chunks), patient }),
      );
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  private getMedicalCardDocDefinition({
    medical_record_number,
    patient,
  }: {
    medical_record_number: string;
    patient: Patient;
  }): TDocumentDefinitions {
    return {
      pageSize: { width: 759, height: 479 },
      pageMargins: 50,
      content: [
        {
          image: 'bg',
          width: 350,
          height: 479,
          absolutePosition: { x: 420 },
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
              text: medical_record_number || '',
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
                widths: [70, 5, '*'],
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
  }

  async generateReciptPdf(
    dto: GenerateReceiptDto,
  ): Promise<{ buffer: Buffer; patient: PatientEntity }> {
    const patient = await this.patientRepository.findByMrNumber(
      dto.medical_record_number,
    );

    if (!patient) {
      throw new HttpException('Patient data not found', HttpStatus.NOT_FOUND);
    }

    return null;
  }
}
