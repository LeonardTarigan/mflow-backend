import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import {
  AddDrugDto,
  AddDrugResponse,
  DrugDetail,
  GetAllDrugsResponse,
  UpdateDrugDto,
} from './drug.model';
import { DrugValidation } from './drug.validation';
import { Prisma } from '@prisma/client';

@Injectable()
export class DrugService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async add(dto: AddDrugDto): Promise<AddDrugResponse> {
    this.logger.info(`DrugService.add(${JSON.stringify(dto)})`);

    const request = this.validationService.validate<AddDrugDto>(
      DrugValidation.ADD,
      dto,
    );

    const res = await this.prismaService.drug.create({
      data: request,
    });

    return res;
  }

  async getAll(page: string, search?: string): Promise<GetAllDrugsResponse> {
    this.logger.info(`DrugService.getAll(page=${page}, search=${search})`);

    let pageNumber = parseInt(page) || 1;

    if (pageNumber == 0)
      throw new HttpException('Invalid page data type', HttpStatus.BAD_REQUEST);

    if (pageNumber < 1) pageNumber = 1;

    const pageSize = 10;
    const offset = (pageNumber - 1) * pageSize;

    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { unit: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const [drugs, totalData] = await Promise.all([
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

  async update(id: string, dto: UpdateDrugDto): Promise<DrugDetail> {
    this.logger.info(
      `DrugService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }

    const request = this.validationService.validate<UpdateDrugDto>(
      DrugValidation.UPDATE,
      dto,
    );

    try {
      const res = await this.prismaService.drug.update({
        where: {
          id: numericId,
        },
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
}
