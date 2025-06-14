import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import {
  AddQueueDto,
  AddQueueResponse,
  CurrentPharmacyQueueDetail,
  GetActivePharmacyQueueResponse,
  GetAllQueuesDetail,
  GetAllQueuesResponse,
  UpdateQueueDto,
  UpdateQueueResponse,
} from './queue.model';
import { QueueValidation } from './queue.validation';
import { QueueStatus } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

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
      queue_number,
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
      queue_number,
      complaints,
      diagnosis,
      doctor,
      patient,
      room,
      created_at,
      updated_at,
    };
  }

  async generateQueueNumber(): Promise<string> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const countToday = await this.prismaService.careSession.count({
      where: {
        created_at: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const nextNumber = countToday + 1;
    if (nextNumber > 999) {
      throw new Error('Queue limit exceeded for today');
    }

    return `U${String(nextNumber).padStart(3, '0')}`;
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

    const queueNumber = await this.generateQueueNumber();

    const res = await this.prismaService.careSession.create({
      data: {
        doctor_id: request.doctor_id,
        complaints: request.complaints,
        status: 'WAITING_CONSULTATION',
        room_id: request.room_id,
        patient_id: patientId,
        queue_number: queueNumber,
      },
    });

    return res;
  }

  async getAll(
    page: string,
    pageSize?: number,
    isQueueActive?: boolean,
    roomId?: number,
  ): Promise<GetAllQueuesResponse> {
    this.logger.info(`QueueService.getAll(page=${page})`);

    let pageNumber = parseInt(page) || 1;

    if (pageNumber == 0)
      throw new HttpException('Invalid page data type', HttpStatus.BAD_REQUEST);

    if (pageNumber < 1) pageNumber = 1;

    const includedFields = {
      patient: {
        select: { id: true, name: true, medical_record_number: true },
      },
      doctor: { select: { id: true, username: true } },
      room: { select: { id: true, name: true } },
      VitalSign: {
        select: {
          height_cm: true,
          weight_kg: true,
          body_temperature_c: true,
          blood_pressure: true,
          heart_rate_bpm: true,
          respiratory_rate_bpm: true,
        },
      },
      CareSessionDiagnosis: {
        select: {
          diagnosis: {
            select: { id: true, name: true },
          },
        },
      },
      DrugOrder: {
        select: {
          quantity: true,
          drug: {
            select: { id: true, name: true, price: true },
          },
        },
      },
    };

    const includedStatuses: QueueStatus[] = isQueueActive
      ? [
          'WAITING_CONSULTATION',
          'IN_CONSULTATION',
          'WAITING_MEDICATION',
          'WAITING_PAYMENT',
        ]
      : ['COMPLETED'];

    const whereClause: any = {
      status: {
        in: includedStatuses,
      },
    };

    if (roomId) {
      whereClause.room_id = roomId;
    }

    if (!pageSize) {
      const careSessions = await this.prismaService.careSession.findMany({
        orderBy: {
          created_at: 'asc',
        },
        include: includedFields,
        where: whereClause,
      });

      return {
        data: careSessions.map((session) => ({
          ...this.transformCareSession(session),
          vital_sign: session.VitalSign
            ? {
                height_cm: session.VitalSign.height_cm,
                weight_kg: session.VitalSign.weight_kg,
                body_temperature_c: session.VitalSign.body_temperature_c,
                blood_pressure: session.VitalSign.blood_pressure,
                heart_rate_bpm: session.VitalSign.heart_rate_bpm,
                respiratory_rate_bpm: session.VitalSign.respiratory_rate_bpm,
              }
            : undefined,
          diagnoses:
            session.CareSessionDiagnosis?.map(({ diagnosis }) => diagnosis) ||
            [],
          drug_orders:
            session.DrugOrder?.map(({ drug, quantity }) => ({
              id: drug.id,
              name: drug.name,
              quantity: quantity,
              price: drug.price,
            })) || [],
        })),
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
        include: includedFields,
        where: whereClause,
      }),
      this.prismaService.careSession.count({
        where: whereClause,
      }),
    ]);

    const totalPage = Math.ceil(totalData / pageSize);
    const previousPage = pageNumber > 1 ? pageNumber - 1 : null;
    const nextPage = pageNumber < totalPage ? pageNumber + 1 : null;

    return {
      data: careSessions.map((session) => ({
        ...this.transformCareSession(session),
        vital_sign: session.VitalSign
          ? {
              height_cm: session.VitalSign.height_cm,
              weight_kg: session.VitalSign.weight_kg,
              body_temperature_c: session.VitalSign.body_temperature_c,
              blood_pressure: session.VitalSign.blood_pressure,
              heart_rate_bpm: session.VitalSign.heart_rate_bpm,
              respiratory_rate_bpm: session.VitalSign.respiratory_rate_bpm,
            }
          : undefined,
        diagnoses:
          session.CareSessionDiagnosis?.map(({ diagnosis }) => diagnosis) || [],
        drug_orders:
          session.DrugOrder?.map(({ drug, quantity }) => ({
            id: drug.id,
            name: drug.name,
            quantity: quantity,
            price: drug.price,
          })) || [],
      })),
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

  async getActivePharmacyQueues(): Promise<GetActivePharmacyQueueResponse> {
    this.logger.info(`QueueService.getActivePharmacyQueues()`);

    const careSessions = await this.prismaService.careSession.findMany({
      orderBy: {
        created_at: 'asc',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            birth_date: true,
            gender: true,
          },
        },
        doctor: { select: { id: true, username: true } },
        CareSessionDiagnosis: {
          select: {
            diagnosis: {
              select: { id: true, name: true },
            },
          },
        },
        DrugOrder: {
          select: {
            quantity: true,
            dose: true,
            drug: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
      where: {
        status: {
          in: ['WAITING_MEDICATION'],
        },
      },
    });

    let currentQueue: CurrentPharmacyQueueDetail;

    if (careSessions.length !== 0) {
      currentQueue = careSessions.map((session) => ({
        id: session.id,
        queue_number: session.queue_number,
        diagnoses:
          session.CareSessionDiagnosis?.map(({ diagnosis }) => diagnosis) || [],
        drug_orders:
          session.DrugOrder?.map(({ drug, quantity, dose }) => ({
            id: drug.id,
            name: drug.name,
            price: drug.price,
            quantity,
            dose,
          })) || [],
        doctor: session.doctor,
        patient: session.patient,
        complaints: session.complaints,
      }))[0];
    }

    return {
      current: currentQueue,
      next_queues: careSessions.slice(1).map((session) => ({
        id: session.id,
        queue_number: session.queue_number,
      })),
    };
  }
}
