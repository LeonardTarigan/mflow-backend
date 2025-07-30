import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { Logger } from 'winston';

import {
  CreateRoomDto,
  GetAllRoomsResponse,
  RoomEntity,
  UpdateRoomDto,
} from './domain/model/room.model';
import { RoomRepository } from './infrastructure/room.repository';

@Injectable()
export class RoomService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private roomRepository: RoomRepository,
  ) {}

  async create(dto: CreateRoomDto): Promise<RoomEntity> {
    this.logger.info(`RoomService.create(${JSON.stringify(dto)})`);

    try {
      const room = await this.roomRepository.create(dto);

      return room;
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
  ): Promise<GetAllRoomsResponse> {
    this.logger.info(
      `RoomService.getAll(page=${pageNumber}, search=${search}, pageSize=${pageSize})`,
    );

    if (pageNumber < 1) pageNumber = 1;

    const offset = (pageNumber - 1) * pageSize;

    let rooms: RoomEntity[];
    let totalData: number;

    if (pageSize) {
      [rooms, totalData] = await this.roomRepository.findManyWithPagination(
        offset,
        pageSize,
        search,
      );
    } else {
      [rooms, totalData] = await this.roomRepository.findMany(search);
    }

    const totalPage = Math.ceil(totalData / pageSize);

    return {
      data: rooms,
      meta: {
        current_page: pageNumber,
        previous_page: pageNumber > 1 ? pageNumber - 1 : null,
        next_page: pageNumber < totalPage ? pageNumber + 1 : null,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async update(id: number, dto: UpdateRoomDto): Promise<RoomEntity> {
    this.logger.info(
      `RoomService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    try {
      const res = await this.roomRepository.update(id, dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2025: 'Data obat tidak ditemukan',
      });

      throw error;
    }
  }

  async delete(id: number): Promise<string> {
    this.logger.info(`RoomService.delete(${id})`);

    try {
      await this.roomRepository.deleteById(id);

      return `Berhasil menghapus ruangan: ${id}`;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2025: 'Data akun tidak ditemukan',
      });

      throw error;
    }
  }
}
