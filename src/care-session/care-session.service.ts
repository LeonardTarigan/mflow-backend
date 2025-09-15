import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { Logger } from 'winston';

import { CareSessionMapper } from './domain/mapper/care-session.mapper';
import {
  CareSessionDetail,
  CreateCareSessionDto,
  CreateCareSessionResponse,
  GetAllCareSessionsResponse,
  QueueStatusFilter,
  UpdateCareSessionDto,
  UpdateCareSessionResponse,
  UpdateCareSessionStatusDto,
} from './domain/model/care-session.model';
import { CareSessionRepository } from './infrastucture/care-session.repository';

@Injectable()
export class CareSessionService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private careSessionRepository: CareSessionRepository,
  ) {}

  async create(dto: CreateCareSessionDto): Promise<CreateCareSessionResponse> {
    this.logger.info(`CareSessionService.create(${JSON.stringify(dto)})`);

    try {
      const res = await this.careSessionRepository.create(dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger);
      throw error;
    }
  }

  async getAll(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    status?: QueueStatusFilter,
    roomId?: number,
    doctorId?: string,
  ): Promise<GetAllCareSessionsResponse> {
    this.logger.info(
      `CareSessionService.getAll(page=${pageNumber}, search=${search}), pageSize=${pageSize}, status=${status}, roomId=${roomId}, doctorId=${doctorId}`,
    );

    if (pageNumber < 1) pageNumber = 1;

    const offset = (pageNumber - 1) * pageSize;

    let careSessions: CareSessionDetail[];
    let totalData: number;

    if (pageSize) {
      const [rawPaginatedCareSessions, totalPaginatedRawCareSessions] =
        await this.careSessionRepository.findManyWithPagination(
          offset,
          pageSize,
          search,
          status,
          roomId,
          doctorId,
        );

      totalData = totalPaginatedRawCareSessions;
      careSessions = CareSessionMapper.toCareSessionDetail(
        rawPaginatedCareSessions,
      );
    } else {
      const [rawCareSessions, totalRawCareSessions] =
        await this.careSessionRepository.findMany(
          search,
          status,
          roomId,
          doctorId,
        );

      totalData = totalRawCareSessions;
      careSessions = CareSessionMapper.toCareSessionDetail(rawCareSessions);
    }

    const totalPage = Math.ceil(totalData / pageSize);

    return {
      data: careSessions,
      meta: {
        current_page: pageNumber,
        previous_page: pageNumber > 1 ? pageNumber - 1 : null,
        next_page: pageNumber < totalPage ? pageNumber + 1 : null,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async update(
    id: number,
    dto: UpdateCareSessionDto,
  ): Promise<UpdateCareSessionResponse> {
    this.logger.info(
      `CareSessionService.update(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    try {
      const res = await this.careSessionRepository.update(id, dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2025: 'Data pelayanan tidak ditemukan',
      });

      throw error;
    }
  }

  async updateStatus(
    id: number,
    dto: UpdateCareSessionStatusDto,
  ): Promise<UpdateCareSessionResponse> {
    this.logger.info(
      `CareSessionService.updateStatus(id=${id}, dto=${JSON.stringify(dto)})`,
    );

    const careSession =
      await this.careSessionRepository.findByIdWithRelations(id);

    if (!careSession) {
      throw new HttpException(
        'Data pelayanan tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }

    if (dto.status === 'IN_CONSULTATION') {
      if (!careSession.VitalSign) {
        throw new HttpException(
          'Lengkapi data vital sign terlebih dahulu sebelum memulai konsultasi',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.status === 'WAITING_MEDICATION') {
      if (!careSession.DrugOrder || careSession.DrugOrder.length === 0) {
        throw new HttpException(
          'Lengkapi data pesanan obat terlebih dahulu sebelum pengambilan obat',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.status === 'WAITING_PAYMENT') {
      const hasDiagnosis =
        careSession.CareSessionDiagnosis &&
        careSession.CareSessionDiagnosis.length > 0;
      const hasTreatment =
        careSession.CareSessionTreatment &&
        careSession.CareSessionTreatment.length > 0;
      if (!hasDiagnosis || !hasTreatment) {
        throw new HttpException(
          'Lengkapi data diagnosa dan tindakan terlebih dahulu sebelum pembayaran',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    try {
      const res = await this.careSessionRepository.update(id, dto);

      return res;
    } catch (error) {
      handlePrismaError(error, this.logger, {
        P2025: 'Data pelayanan tidak ditemukan',
      });

      throw error;
    }
  }
}
