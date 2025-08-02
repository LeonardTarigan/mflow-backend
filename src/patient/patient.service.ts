import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { Logger } from 'winston';

import {
  CreatePatientDto,
  GetAllPatientsResponse,
  PatientEntity,
  UpdatePatientDto,
} from './domain/model/patient.model';
import { PatientRepository } from './infrastucture/patient.repository';

@Injectable()
export class PatientService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private patientRepository: PatientRepository,
  ) {}

  async create(dto: CreatePatientDto): Promise<PatientEntity> {
    this.logger.info(`PatientService.add(${JSON.stringify(dto)})`);

    try {
      const res = await this.patientRepository.create({
        ...dto,
        birth_date: new Date(dto.birth_date).toISOString(),
      });

      return res;
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | string | undefined;

        if (
          (Array.isArray(target) && target.includes('nik')) ||
          (typeof target === 'string' && target.includes('nik'))
        ) {
          throw new HttpException(
            'NIK sudah terdaftar!',
            HttpStatus.BAD_REQUEST,
          );
        } else if (
          (Array.isArray(target) && target.includes('medical_record_number')) ||
          (typeof target === 'string' &&
            target.includes('medical_record_number'))
        ) {
          throw new HttpException(
            'Nomor Rekam Medis sudah terdaftar!',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      throw error;
    }
  }

  async getAll(
    pageNumber: number,
    pageSize?: number,
    search?: string,
  ): Promise<GetAllPatientsResponse> {
    this.logger.info(
      `PatientService.getAll(page=${pageNumber}, search=${search})`,
    );

    if (pageNumber < 1) pageNumber = 1;

    const offset = (pageNumber - 1) * pageSize;

    let patients: PatientEntity[];
    let totalData: number;

    if (pageSize) {
      [patients, totalData] =
        await this.patientRepository.findManyWithPagination(
          offset,
          pageSize,
          search,
        );
    } else {
      [patients, totalData] = await this.patientRepository.findMany(search);
    }

    const totalPage = Math.ceil(totalData / pageSize);

    return {
      data: patients,
      meta: {
        current_page: pageNumber,
        previous_page: pageNumber > 1 ? pageNumber - 1 : null,
        next_page: pageNumber < totalPage ? pageNumber + 1 : null,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async getByMrNumber(mrNumber: string): Promise<PatientEntity> {
    this.logger.info(`UserService.getByMrNumber(${mrNumber})`);

    const res = await this.patientRepository.findByMrNumber(mrNumber);

    if (!res)
      throw new HttpException(
        'Data pasien tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return res;
  }

  async update(id: string, dto: UpdatePatientDto): Promise<PatientEntity> {
    this.logger.info(
      `UserService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    try {
      const res = await this.patientRepository.update(id, dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2025: 'Data pasien tidak ditemukan',
      });

      throw error;
    }
  }
}
