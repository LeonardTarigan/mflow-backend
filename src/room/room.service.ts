import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import {
  AddRoomDto,
  AddRoomResponse,
  GetAllRoomsResponse,
  UpdateRoomDto,
} from './room.model';
import { RoomValidation } from './room.validation';
import { Prisma, Room } from '@prisma/client';

@Injectable()
export class RoomService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async add(dto: AddRoomDto): Promise<AddRoomResponse> {
    this.logger.info(`RoomService.add(${JSON.stringify(dto)})`);

    const request = this.validationService.validate<AddRoomDto>(
      RoomValidation.ADD,
      dto,
    );

    const res = await this.prismaService.room.create({
      data: request,
    });

    return res;
  }

  async getAll(
    page: string,
    search?: string,
    pageSize?: number,
  ): Promise<GetAllRoomsResponse> {
    this.logger.info(`RoomService.getAll(page=${page}, search=${search})`);

    let pageNumber = parseInt(page) || 1;

    if (pageNumber == 0)
      throw new HttpException('Invalid page data type', HttpStatus.BAD_REQUEST);

    if (pageNumber < 1) pageNumber = 1;

    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { unit: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    if (!pageSize) {
      const rooms = await this.prismaService.room.findMany({
        where: searchFilter,
        orderBy: {
          name: 'asc',
        },
      });

      return {
        data: rooms,
        meta: {
          current_page: 1,
          previous_page: null,
          next_page: null,
          total_page: 1,
          total_data: rooms.length,
        },
      };
    }

    const offset = (pageNumber - 1) * pageSize;

    const [rooms, totalData] = await Promise.all([
      this.prismaService.room.findMany({
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
      data: rooms,
      meta: {
        current_page: pageNumber,
        previous_page: previousPage,
        next_page: nextPage,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async update(id: string, dto: UpdateRoomDto): Promise<Room> {
    this.logger.info(
      `RoomService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }

    const request = this.validationService.validate<UpdateRoomDto>(
      RoomValidation.UPDATE,
      dto,
    );

    try {
      const res = await this.prismaService.room.update({
        where: {
          id: numericId,
        },
        data: request,
      });

      return res;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Data ruangan tidak ditemukan!',
          HttpStatus.NOT_FOUND,
        );
      }
      throw error;
    }
  }

  async delete(id: string): Promise<string> {
    this.logger.info(`RoomService.delete(${id})`);

    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.prismaService.room.delete({
        where: {
          id: numericId,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Data ruangan tidak ditemukan!',
          HttpStatus.NOT_FOUND,
        );
      }
      throw error;
    }

    return `Successfully deleted: ${id}`;
  }
}
