import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import {
  AddQueueDto,
  AddQueueResponse,
  GetAllQueuesDetail,
  GetAllQueuesResponse,
  UpdateQueueDto,
  UpdateQueueResponse,
} from './queue.model';
import { QueueValidation } from './queue.validation';
import { QueueStatus } from '@prisma/client';

@Injectable()
export class QueueService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  transformCareSession(session: GetAllQueuesDetail) {
    const {
      id,
      status,
      complaints,
      diagnosis,
      doctor,
      patient,
      room,
      created_at,
      updated_at,
    } = session;

    return {
      id,
      status,
      complaints,
      diagnosis,
      doctor,
      patient,
      room,
      created_at,
      updated_at,
    };
  }

  async add(dto: AddQueueDto): Promise<AddQueueResponse> {
    this.logger.info(`QueueService.add(${JSON.stringify(dto)})`);

    const request = this.validationService.validate<AddQueueDto>(
      QueueValidation.ADD,
      dto,
    );

    let patientId = request.patient_id;

    if (!request.patient_id) {
      const newPatient = await this.prismaService.patient.create({
        data: {
          ...request.patient_data,
        },
      });

      this.logger.info(
        `New patient data added : (${JSON.stringify(newPatient)})`,
      );

      patientId = newPatient.id;
    }

    const res = await this.prismaService.careSession.create({
      data: {
        doctor_id: request.doctor_id,
        complaints: request.complaints,
        status: 'WAITING_CONSULTATION',
        room_id: request.room_id,
        patient_id: patientId,
      },
    });

    return res;
  }

  async getAll(
    page: string,
    pageSize?: number,
    isQueueActive?: boolean,
  ): Promise<GetAllQueuesResponse> {
    this.logger.info(`DrugService.getAll(page=${page})`);

    let pageNumber = parseInt(page) || 1;

    if (pageNumber == 0)
      throw new HttpException('Invalid page data type', HttpStatus.BAD_REQUEST);

    if (pageNumber < 1) pageNumber = 1;

    const includedFields = {
      patient: { select: { id: true, name: true } },
      doctor: { select: { id: true, username: true } },
      room: { select: { id: true, name: true } },
    };

    const includedStatuses: QueueStatus[] = isQueueActive
      ? [
          'WAITING_CONSULTATION',
          'IN_CONSULTATION',
          'WAITING_MEDICATION',
          'WAITING_PAYMENT',
        ]
      : ['COMPLETED'];

    if (!pageSize) {
      const careSessions = await this.prismaService.careSession.findMany({
        orderBy: {
          created_at: 'asc',
        },
        include: includedFields,
        where: {
          status: {
            in: includedStatuses,
          },
        },
      });

      return {
        data: careSessions.map(this.transformCareSession),
        meta: {
          current_page: 1,
          previous_page: null,
          next_page: null,
          total_page: 1,
          total_data: careSessions.length,
        },
      };
    }

    const offset = (pageNumber - 1) * pageSize;

    const [careSessions, totalData] = await Promise.all([
      this.prismaService.careSession.findMany({
        skip: offset,
        take: pageSize,
        orderBy: {
          created_at: 'asc',
        },
        include: {
          patient: { select: { id: true, name: true } },
          doctor: { select: { id: true, username: true } },
          room: { select: { id: true, name: true } },
        },
        where: {
          status: {
            in: includedStatuses,
          },
        },
      }),
      this.prismaService.drug.count(),
    ]);

    const totalPage = Math.ceil(totalData / pageSize);
    const previousPage = pageNumber > 1 ? pageNumber - 1 : null;
    const nextPage = pageNumber < totalPage ? pageNumber + 1 : null;

    return {
      data: careSessions.map(this.transformCareSession),
      meta: {
        current_page: pageNumber,
        previous_page: previousPage,
        next_page: nextPage,
        total_page: totalPage,
        total_data: totalData,
      },
    };
  }

  async update(id: string, dto: UpdateQueueDto): Promise<UpdateQueueResponse> {
    this.logger.info(`QueueService.update(${id}, ${JSON.stringify(dto)})`);

    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      throw new HttpException('Invalid ID type', HttpStatus.BAD_REQUEST);
    }

    const request = this.validationService.validate<UpdateQueueDto>(
      QueueValidation.UPDATE,
      dto,
    );

    try {
      const res = await this.prismaService.careSession.update({
        where: {
          id: numericId,
        },
        data: request,
      });

      return res;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Data pelayanan tidak ditemukan!',
          HttpStatus.NOT_FOUND,
        );
      }
      throw error;
    }
  }
}
