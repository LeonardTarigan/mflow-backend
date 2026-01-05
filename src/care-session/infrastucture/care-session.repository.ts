import { Injectable } from '@nestjs/common';
import { CareSession, Prisma } from '@prisma/client';
import * as dayjs from 'dayjs';
import { PrismaService } from 'src/common/prisma.service';

import { QueueStatusFilter } from '../domain/model/care-session.model';

const selectedFields: Prisma.CareSessionSelect = {
  id: true,
  complaints: true,
  status: true,
  queue_number: true,
  patient: {
    select: {
      id: true,
      name: true,
      medical_record_number: true,
      birth_date: true,
      gender: true,
      occupation: true,
    },
  },
  doctor: { select: { id: true, username: true } },
  room: { select: { id: true, name: true } },
  created_at: true,
  updated_at: true,
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
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  CareSessionTreatment: {
    select: {
      treatment: {
        select: { id: true, name: true },
      },
      quantity: true,
      applied_price: true,
    },
  },
  DrugOrder: {
    select: {
      id: true,
      applied_price: true,
      quantity: true,
      dose: true,
      drug: {
        select: {
          id: true,
          name: true,
          unit: true,
        },
      },
    },
  },
};

export type CareSessionRawResponse = Prisma.CareSessionGetPayload<{
  select: typeof selectedFields;
}>;

@Injectable()
export class CareSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getWhereClause(
    keyword?: string,
    status?: QueueStatusFilter,
    roomId?: number,
    doctorId?: string,
    dateRange?: string,
  ): Prisma.CareSessionWhereInput {
    const where: Prisma.CareSessionWhereInput = {};

    if (keyword) {
      where.OR = [
        { patient: { name: { contains: keyword, mode: 'insensitive' } } },
        { doctor: { username: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    if (!status || status === 'ACTIVE') {
      where.status = { not: 'COMPLETED' };
    } else if (status) {
      where.status = status;
    }

    if (roomId) {
      where.room_id = roomId;
    }

    if (doctorId) {
      where.doctor_id = doctorId;
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split('_');

      where.created_at = {
        gte: dayjs(startDate).startOf('day').toDate(),
        lte: dayjs(endDate).endOf('day').toDate(),
      };
    }

    return where;
  }

  async create(
    data: Prisma.CareSessionUncheckedCreateInput,
  ): Promise<CareSession> {
    return this.prisma.careSession.create({ data });
  }

  async findMany(
    keyword?: string,
    status?: QueueStatusFilter,
    roomId?: number,
    doctorId?: string,
    dateRange?: string,
  ): Promise<[CareSessionRawResponse[], number]> {
    const whereClause = this.getWhereClause(
      keyword,
      status,
      roomId,
      doctorId,
      dateRange,
    );

    return this.prisma.$transaction([
      this.prisma.careSession.findMany({
        where: whereClause,
        orderBy: { created_at: status === 'COMPLETED' ? 'desc' : 'asc' },
        select: selectedFields,
      }),
      this.prisma.careSession.count({ where: whereClause }),
    ]);
  }

  async findManyWithPagination(
    offset: number,
    limit: number,
    keyword?: string,
    status?: QueueStatusFilter,
    roomId?: number,
    doctorId?: string,
    dateRange?: string,
  ): Promise<[CareSessionRawResponse[], number]> {
    const whereClause = this.getWhereClause(
      keyword,
      status,
      roomId,
      doctorId,
      dateRange,
    );

    return this.prisma.$transaction([
      this.prisma.careSession.findMany({
        skip: offset,
        take: limit,
        where: whereClause,
        orderBy: { created_at: 'desc' },
        select: selectedFields,
      }),
      this.prisma.careSession.count({ where: whereClause }),
    ]);
  }

  async findById(id: number): Promise<CareSession> {
    return this.prisma.careSession.findUnique({
      where: { id },
    });
  }

  async findRunningDoctorSession(doctorId: string): Promise<CareSession> {
    return this.prisma.careSession.findFirst({
      where: {
        doctor_id: doctorId,
        status: 'IN_CONSULTATION',
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async findByIdWithRelations(id: number) {
    return this.prisma.careSession.findUnique({
      where: { id },
      include: {
        VitalSign: true,
        DrugOrder: {
          select: {
            drug: { select: { name: true } },
            quantity: true,
            applied_price: true,
          },
        },
        CareSessionDiagnosis: true,
        CareSessionTreatment: {
          select: {
            treatment: { select: { name: true } },
            quantity: true,
            applied_price: true,
          },
        },
        doctor: {
          select: { id: true, username: true },
        },
        patient: {
          select: {
            id: true,
            name: true,
            phone_number: true,
            medical_record_number: true,
          },
        },
      },
    });
  }

  async countTodaysQueueNumber(
    startTime: Date,
    endTime: Date,
  ): Promise<number> {
    return this.prisma.careSession.count({
      where: {
        created_at: {
          gte: startTime,
          lte: endTime,
        },
      },
    });
  }

  async update(
    id: number,
    data: Prisma.CareSessionUpdateInput,
  ): Promise<CareSession> {
    return this.prisma.careSession.update({ where: { id }, data });
  }

  async deleteById(id: number): Promise<CareSession> {
    return this.prisma.careSession.delete({ where: { id } });
  }
}
