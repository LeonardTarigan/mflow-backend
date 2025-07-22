import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';

import {
  CreateDrugDto,
  DrugEntity,
  GetAllDrugsResponse,
  UpdateDrugDto,
} from './drug.model';
import { DrugValidation } from './drug.validation';

@Injectable()
export class DrugService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private prismaService: PrismaService,
  ) {}

  async create(dto: CreateDrugDto): Promise<DrugEntity> {
    this.logger.info(`DrugService.add(${JSON.stringify(dto)})`);

    const validatedReq = this.validationService.validate<CreateDrugDto>(
      DrugValidation.ADD,
      dto,
    );

    try {
      const res = await this.prismaService.drug.create({
        data: validatedReq,
      });

      return res;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          `Obat dengan nama ${validatedReq.name} sudah ada!`,
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }

  async getAll(
    pageNumber: number,
    pageSize: number,
    search?: string,
  ): Promise<GetAllDrugsResponse> {
    this.logger.info(
      `DrugService.getAll(page=${pageNumber}, search=${search}), pageSize=${pageSize}`,
    );

    const offset = (pageNumber - 1) * pageSize;

    if (pageNumber < 1) pageNumber = 1;

    const searchFilter: Prisma.DrugWhereInput | undefined = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { unit: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const [drugs, totalData] = await this.prismaService.$transaction([
      this.prismaService.drug.findMany({
        skip: offset,
        take: pageSize,
        where: searchFilter,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prismaService.drug.count({
        where: searchFilter,
      }),
    ]);

    const totalPage = Math.ceil(totalData / pageSize);
    const previousPage = pageNumber > 1 ? pageNumber - 1 : null;
    const nextPage = pageNumber < totalPage ? pageNumber + 1 : null;

    return {
      data: drugs,
      meta: {
        current_page: pageNumber,
        previous_page: previousPage,
        next_page: nextPage,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async update(id: number, dto: UpdateDrugDto): Promise<DrugEntity> {
    this.logger.info(
      `DrugService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    const request = this.validationService.validate<UpdateDrugDto>(
      DrugValidation.UPDATE,
      dto,
    );

    try {
      const res = await this.prismaService.drug.update({
        where: { id },
        data: request,
      });

      return res;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Data obat tidak ditemukan!',
          HttpStatus.NOT_FOUND,
        );
      }
      throw error;
    }
  }

  async delete(id: number): Promise<string> {
    this.logger.info(`DrugService.delete(${id})`);

    try {
      const drug = await this.prismaService.drug.delete({
        where: { id },
      });

      return `Berhasil menghapus obat ${drug.name}`;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Data obat tidak ditemukan!',
          HttpStatus.NOT_FOUND,
        );
      }
      throw error;
    }
  }
}
