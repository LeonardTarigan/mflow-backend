import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Prisma, Room } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';

import {
  CreateRoomDto,
  GetAllRoomsResponse,
  RoomEntity,
  UpdateRoomDto,
} from './room.model';
import { RoomValidation } from './room.validation';

@Injectable()
export class RoomService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async create(dto: CreateRoomDto): Promise<RoomEntity> {
    this.logger.info(`RoomService.create(${JSON.stringify(dto)})`);

    const validatedReq = this.validationService.validate<CreateRoomDto>(
      RoomValidation.ADD,
      dto,
    );

    try {
      const room = await this.prismaService.room.create({
        data: validatedReq,
      });
      return room;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          `Ruangan dengan nama "${validatedReq.name}" sudah ada!`,
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }

  async getAll(
    pageNumber?: number,
    search?: string,
    pageSize?: number,
  ): Promise<GetAllRoomsResponse> {
    this.logger.info(
      `RoomService.getAll(page=${pageNumber}, search=${search}, pageSize=${pageSize})`,
    );

    const offset = (pageNumber - 1) * pageSize;

    if (pageNumber < 1) pageNumber = 1;

    const whereClause: Prisma.RoomWhereInput | undefined = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const [rooms, totalData] = await this.prismaService.$transaction([
      this.prismaService.room.findMany({
        skip: offset,
        take: pageSize,
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      this.prismaService.room.count({
        where: whereClause,
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

  async update(id: number, dto: UpdateRoomDto): Promise<Room> {
    this.logger.info(
      `RoomService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    const request = this.validationService.validate<UpdateRoomDto>(
      RoomValidation.UPDATE,
      dto,
    );

    try {
      const res = await this.prismaService.room.update({
        where: { id },
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

  async delete(id: number): Promise<string> {
    this.logger.info(`RoomService.delete(${id})`);

    try {
      const room = await this.prismaService.room.delete({
        where: { id },
      });

      return `Berhasil menghapus ruangan ${room.name}`;
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
}
