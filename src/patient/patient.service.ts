import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';

import {
  AddPatientDto,
  AddPatientResponse,
  GetAllPatientsResponse,
  PatientDetail,
  UpdatePatientDto,
} from './patient.model';
import { PatientValidation } from './patient.validation';

@Injectable()
export class PatientService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async add(dto: AddPatientDto): Promise<AddPatientResponse> {
    this.logger.info(`PatientService.add(${JSON.stringify(dto)})`);

    const request = this.validationService.validate<AddPatientDto>(
      PatientValidation.ADD,
      dto,
    );

    try {
      const res = await this.prismaService.patient.create({
        data: request,
      });
      return res;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target as string[] | string | undefined;
        if (
          (Array.isArray(target) && target.includes('nik')) ||
          (typeof target === 'string' && target.includes('nik'))
        ) {
          throw new HttpException(
            'NIK sudah terdaftar!',
            HttpStatus.BAD_REQUEST,
          );
        }
        if (
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
    page: string,
    search?: string,
    pageSize?: number,
  ): Promise<GetAllPatientsResponse> {
    this.logger.info(`PatientService.getAll(page=${page}, search=${search})`);

    let pageNumber = parseInt(page) || 1;

    if (pageNumber == 0)
      throw new HttpException('Invalid page data type', HttpStatus.BAD_REQUEST);

    if (pageNumber < 1) pageNumber = 1;

    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { nik: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              medical_record_number: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : undefined;

    if (!pageSize) {
      const patients = await this.prismaService.patient.findMany({
        where: searchFilter,
        orderBy: {
          name: 'asc',
        },
      });

      return {
        data: patients,
        meta: {
          current_page: 1,
          previous_page: null,
          next_page: null,
          total_page: 1,
          total_data: patients.length,
        },
      };
    }

    const offset = (pageNumber - 1) * pageSize;

    const [patients, totalData] = await Promise.all([
      this.prismaService.patient.findMany({
        skip: offset,
        take: pageSize,
        where: searchFilter,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prismaService.patient.count({
        where: searchFilter,
      }),
    ]);

    const totalPage = Math.ceil(totalData / pageSize);
    const previousPage = pageNumber > 1 ? pageNumber - 1 : null;
    const nextPage = pageNumber < totalPage ? pageNumber + 1 : null;

    return {
      data: patients,
      meta: {
        current_page: pageNumber,
        previous_page: previousPage,
        next_page: nextPage,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async getByMrNumber(mrNumber: string): Promise<PatientDetail> {
    this.logger.info(`UserService.getByMrNumber(${mrNumber})`);

    const patientData = await this.prismaService.patient.findUnique({
      where: {
        medical_record_number: mrNumber,
      },
    });

    if (!patientData)
      throw new HttpException(
        'Data pasien tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return patientData;
  }

  async update(id: string, dto: UpdatePatientDto): Promise<PatientDetail> {
    this.logger.info(
      `UserService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    const request = this.validationService.validate<UpdatePatientDto>(
      PatientValidation.UPDATE,
      dto,
    );

    try {
      const patientData = await this.prismaService.patient.update({
        where: {
          id: id,
        },
        data: request,
      });

      return patientData;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Data pasien tidak ditemukan!',
          HttpStatus.NOT_FOUND,
        );
      }
      throw error;
    }
  }
}
