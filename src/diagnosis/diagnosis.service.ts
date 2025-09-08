import * as https from 'https';

import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { Logger } from 'winston';

import {
  CreateDiagnosisDto,
  CreateDiagnosisResponse,
  GetAllDiagnosesResponse,
  GetDiagnosisByIdResponse,
  IcdDiagnosis,
} from './domain/model/diagnosis.model';
import { DiagnosisRepository } from './infrastucture/diagnosis.repository';

@Injectable()
export class DiagnosisService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private diagnosisRepository: DiagnosisRepository,
    private httpService: HttpService,
  ) {}

  async create(dto: CreateDiagnosisDto): Promise<CreateDiagnosisResponse> {
    this.logger.info(`DiagnosisService.add(${JSON.stringify(dto)})`);

    try {
      const res = await this.diagnosisRepository.create(dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2002: `Diagnosis dengan kode ${dto.id} sudah terdaftar!`,
      });

      throw error;
    }
  }

  async getAll(query: string): Promise<GetAllDiagnosesResponse> {
    this.logger.info(`DiagnosisService.getAll(query=${query})`);

    const [diagnoses] = await this.diagnosisRepository.findMany(query);

    return {
      data: diagnoses,
    };
  }

  async getAllIcdDiagnoses(query: string): Promise<IcdDiagnosis[]> {
    const baseUrl = `https://icd.who.int/browse10/2010/en/ACSearch`;
    const url = `${baseUrl}?q=${encodeURIComponent(query)}`;

    this.logger.info(`Fetching ICD data from: ${url}`);

    try {
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Accept: 'text/html',
            'User-Agent': 'Chrome/108.0.0.0',
          },
          httpsAgent: agent,
        }),
      );

      const $ = cheerio.load(response.data);
      const results: IcdDiagnosis[] = [];

      $('.searchresults .oneentity').each((_, el) => {
        const code = $(el).find('> span > span[thecode]').text().trim();
        const title = $(el).find('> span > .title > .titlelabel').text().trim();
        const link = $(el).attr('data-stemid');

        if (code && title) {
          results.push({ code, title, link: link || null });
        }
      });

      return results;
    } catch (error) {
      this.logger.error('Error fetching ICD data:', error);
      throw new HttpException(
        'Failed to fetch ICD data',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getById(id: string): Promise<GetDiagnosisByIdResponse> {
    this.logger.info(`TreatementService.getById(${id})`);

    const treatment = await this.diagnosisRepository.findById(id);

    if (!treatment)
      throw new HttpException(
        'Data diagnosis tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return treatment;
  }
}
