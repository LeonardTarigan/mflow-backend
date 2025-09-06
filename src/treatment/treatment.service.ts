import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { Logger } from 'winston';

import {
  CreateTreatmentDto,
  CreateTreatmentResponse,
  GetAllTreatmentsResponse,
  GetTreatmentByIdResponse,
  TreatmentEntity,
  UpdateTreatmentDto,
  UpdateTreatmentResponse,
} from './domain/model/treatment.model';
import { TreatmentRepository } from './infrastructure/treatment.repository';

@Injectable()
export class TreatmentService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private treatmentRepository: TreatmentRepository,
  ) {}

  async create(dto: CreateTreatmentDto): Promise<CreateTreatmentResponse> {
    this.logger.info(`TreatmentService.create(${JSON.stringify(dto)})`);

    try {
      const res = await this.treatmentRepository.create(dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2002: `Penanganan dengan nama ${dto.name} sudah terdaftar!`,
      });

      throw error;
    }
  }

  async getAll(
    pageNumber: number,
    pageSize?: number,
    search?: string,
  ): Promise<GetAllTreatmentsResponse> {
    this.logger.info(
      `TreatmentService.getAll(page=${pageNumber}, pageSize=${pageSize}, search=${search})`,
    );

    if (pageNumber < 1) pageNumber = 1;

    const offset = (pageNumber - 1) * pageSize;

    let treatments: TreatmentEntity[];
    let totalData: number;

    if (pageSize) {
      [treatments, totalData] =
        await this.treatmentRepository.findManyWithPagination(
          offset,
          pageSize,
          search,
        );
    } else {
      [treatments, totalData] = await this.treatmentRepository.findMany(search);
    }

    const totalPage = Math.ceil(totalData / pageSize);

    return {
      data: treatments,
      meta: {
        current_page: pageNumber,
        previous_page: pageNumber > 1 ? pageNumber - 1 : null,
        next_page: pageNumber < totalPage ? pageNumber + 1 : null,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async getById(id: number): Promise<GetTreatmentByIdResponse> {
    this.logger.info(`TreatementService.getById(${id})`);

    const treatment = await this.treatmentRepository.findById(id);

    if (!treatment)
      throw new HttpException(
        'Data penanganan tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return treatment;
  }

  async update(
    id: number,
    dto: UpdateTreatmentDto,
  ): Promise<UpdateTreatmentResponse> {
    this.logger.info(
      `TreatmentService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    try {
      const res = await this.treatmentRepository.update(id, dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2025: 'Data penanganan tidak ditemukan',
      });

      throw error;
    }
  }

  async delete(id: number): Promise<string> {
    this.logger.info(`TreatmentService.delete(${id})`);

    try {
      await this.treatmentRepository.deleteById(id);

      return `Berhasil menghapus obat: ${id}`;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2025: 'Data akun tidak ditemukan',
      });

      throw error;
    }
  }
}
