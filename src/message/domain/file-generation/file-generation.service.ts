import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Patient } from '@prisma/client';
import * as dayjs from 'dayjs';
import 'dayjs/locale/id';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  GenerateMedicalCardDto,
  GenerateMedicalCardResponse,
  GenerateReceiptDto,
  GenerateReceiptResponse,
  ReceiptDocumentProps,
  ReceiptItem,
} from 'src/message/domain/model/message.model';
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

    dayjs.locale('id');

    this.printer = new this.PdfPrinter(fonts);
  }

  async generateMedicalCardPdf(
    dto: GenerateMedicalCardDto,
  ): Promise<GenerateMedicalCardResponse> {
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
  ): Promise<GenerateReceiptResponse> {
    const { patient_name, phone_number, transaction_date, ...rest } = dto;

    const docDefinition = this.getReceiptDocDefinition({
      ...rest,
      patient_name,
      transaction_date: dayjs(transaction_date).format('DD MMMM YYYY'),
      printed_date: dayjs().format('DD MMMM YYYY HH:mm:ss'),
    });

    const pdfDoc = this.printer.createPdfKitDocument(docDefinition);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () =>
        resolve({
          buffer: Buffer.concat(chunks),
          patient_name,
          phone_number,
        }),
      );
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  private getReceiptDocDefinition({
    patient_name,
    medical_record_number,
    doctor_name,
    transaction_date,
    printed_date,
    treatment_list,
    drug_order_list,
    total_amount,
  }: ReceiptDocumentProps): TDocumentDefinitions {
    const formatRp = (val: number): string =>
      `Rp${val.toLocaleString('id-ID').replace(',', '.')}`;

    const renderReceiptList = (list: ReceiptItem[]): Content => ({
      stack: (list || [])
        .filter((item) => item.name && item.price)
        .map((item) => ({
          columns: [
            {
              text: `${item.quantity}x  ${item.name}`,
              fontSize: 14,
              color: '#374151',
            },
            {
              text: formatRp(item.price * item.quantity),
              fontSize: 14,
              alignment: 'right',
              color: '#374151',
            },
          ],
          margin: [0, 0, 0, 10],
        })),
    });

    return {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        {
          columns: [
            {
              image: 'logo',
              width: 110,
              height: 25,
            },
          ],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              dash: { length: 2 },
            },
          ],
          margin: [0, 20, 0, 10],
        },
        {
          text: 'NOTA PEMBAYARAN',
          fontSize: 18,
          alignment: 'center',
          bold: true,
          margin: [0, 10, 0, 10],
        },
        {
          columns: [
            {
              width: '*',
              table: {
                widths: [70, 5, '*'],
                heights: 16,
                body: [
                  ['Nama', ':', patient_name],
                  ['No. MR', ':', medical_record_number],
                ],
              },
              layout: 'noBorders',
              fontSize: 12,
              margin: [0, 0, 0, 0],
            },
            {
              width: '*',
              table: {
                widths: [70, 5, '*'],
                heights: 16,
                body: [
                  ['Dokter', ':', doctor_name],
                  ['Tgl Transaksi', ':', transaction_date],
                ],
              },
              layout: 'noBorders',
              fontSize: 12,
              margin: [0, 0, 0, 0],
            },
          ],
          margin: [0, 0, 0, 0],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              dash: { length: 2 },
            },
          ],
          margin: [0, 20, 0, 20],
        },
        {
          text: 'Biaya Penanganan',
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        renderReceiptList(treatment_list),
        drug_order_list.length > 0 && {
          text: 'Biaya Obat',
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 10],
        },
        renderReceiptList(drug_order_list),
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              dash: { length: 2 },
            },
          ],
          margin: [0, 20, 0, 20],
        },
        {
          columns: [
            {
              text: 'Total Tagihan',
              fontSize: 14,
              bold: true,
              color: '#374151',
            },
            {
              text: formatRp(total_amount),
              fontSize: 16,
              bold: true,
              alignment: 'right',
              color: '#111827',
            },
          ],
        },
        {
          text: `Dicetak pada ${printed_date}`,
          fontSize: 9,
          color: '#9CA3AF',
          alignment: 'right',
          absolutePosition: { x: 40, y: 780 },
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
}
