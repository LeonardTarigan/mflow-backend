import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { Logger } from 'winston';

import {
  CreateDrugDto,
  CreateDrugResponse,
  DrugEntity,
  GetAllDrugsResponse,
  GetDrugByIdResponse,
  UpdateDrugDto,
  UpdateDrugResponse,
} from './domain/model/drug.model';
import { DrugRepository } from './infrastucture/drug.repository';

@Injectable()
export class DrugService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private drugRepository: DrugRepository,
  ) {}

  async create(dto: CreateDrugDto): Promise<CreateDrugResponse> {
    this.logger.info(`DrugService.add(${JSON.stringify(dto)})`);

    try {
      const res = await this.drugRepository.create(dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2002: `Obat dengan nama ${dto.name} sudah terdaftar!`,
      });

      throw error;
    }
  }

  async getAll(
    pageNumber: number,
    pageSize?: number,
    search?: string,
  ): Promise<GetAllDrugsResponse> {
    this.logger.info(
      `DrugService.getAll(page=${pageNumber}, search=${search}), pageSize=${pageSize}`,
    );

    if (pageNumber < 1) pageNumber = 1;

    const offset = (pageNumber - 1) * pageSize;

    let drugs: DrugEntity[];
    let totalData: number;

    if (pageSize) {
      [drugs, totalData] = await this.drugRepository.findManyWithPagination(
        offset,
        pageSize,
        search,
      );
    } else {
      [drugs, totalData] = await this.drugRepository.findMany(search);
    }

    const totalPage = Math.ceil(totalData / pageSize);

    return {
      data: drugs,
      meta: {
        current_page: pageNumber,
        previous_page: pageNumber > 1 ? pageNumber - 1 : null,
        next_page: pageNumber < totalPage ? pageNumber + 1 : null,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async getById(id: number): Promise<GetDrugByIdResponse> {
    this.logger.info(`DrugService.getById(${id})`);

    const treatment = await this.drugRepository.findById(id);

    if (!treatment)
      throw new HttpException(
        'Data obat tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );

    return treatment;
  }

  async update(id: number, dto: UpdateDrugDto): Promise<UpdateDrugResponse> {
    this.logger.info(
      `DrugService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    try {
      const res = await this.drugRepository.update(id, dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2025: 'Data obat tidak ditemukan',
      });

      throw error;
    }
  }

  async delete(id: number): Promise<string> {
    this.logger.info(`DrugService.delete(${id})`);

    try {
      await this.drugRepository.deleteById(id);

      return `Berhasil menghapus obat: ${id}`;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2025: 'Data akun tidak ditemukan',
      });

      throw error;
    }
  }
}
