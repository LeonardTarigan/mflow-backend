import { Inject, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { Logger } from 'winston';

import {
  GetDailyIncomeDto,
  GetDailyIncomeResponse,
  GetQuickStatsResponse,
} from './domain/model/statistic.model';

@Injectable()
export class StatisticService {
  private yesterday = dayjs().subtract(1, 'day').startOf('day').toDate();
  private today = dayjs().startOf('day').toDate();
  private tomorrow = dayjs().add(1, 'day').startOf('day').toDate();
  private startOfCurrentMonth = dayjs().startOf('month').toDate();
  private startOfLastMonth = dayjs()
    .subtract(1, 'month')
    .startOf('month')
    .toDate();

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async getTodaysVisit(): Promise<GetQuickStatsResponse> {
    this.logger.info(`StatisticService.getTodaysVisit()`);

    try {
      const todaysVisits = await this.prismaService.careSession.findMany({
        where: {
          created_at: {
            gte: this.today,
            lt: this.tomorrow,
          },
        },
      });

      const yesterdaysVisits = await this.prismaService.careSession.findMany({
        where: {
          created_at: {
            gte: this.yesterday,
            lt: this.today,
          },
        },
      });

      const yesterdaysTotalVisit = yesterdaysVisits.length;
      const todaysTotalVisit = todaysVisits.length;

      let percentage = 0;
      if (yesterdaysTotalVisit === 0) {
        if (todaysTotalVisit > 0) percentage = 100;
      } else {
        percentage =
          ((todaysTotalVisit - yesterdaysTotalVisit) / yesterdaysTotalVisit) *
          100;
      }

      percentage = parseFloat(percentage.toFixed(2));

      return { total: todaysTotalVisit, percentage };
    } catch {
      this.logger.error(`Failed to get Todays Visit statistic`);
    }
  }

  async getTotalRegisteredPatient(): Promise<GetQuickStatsResponse> {
    this.logger.info(`StatisticService.getTotalRegisteredPatient()`);

    try {
      const patients = await this.prismaService.patient.findMany();

      const patientsLastMonth = await this.prismaService.patient.findMany({
        where: {
          created_at: {
            lt: this.startOfCurrentMonth,
          },
        },
      });

      const totalPatient = patients.length;
      const totalPatientLastMonth = patientsLastMonth.length;

      let percentage = 0;
      if (totalPatientLastMonth === 0) {
        if (totalPatient > 0) percentage = 100;
      } else {
        percentage =
          ((totalPatient - totalPatientLastMonth) / totalPatientLastMonth) *
          100;
      }

      percentage = parseFloat(percentage.toFixed(2));

      return { total: totalPatient, percentage };
    } catch {
      this.logger.error(`Failed to get Total Registered Patient statistic`);
    }
  }

  async getTotalNewPatient(): Promise<GetQuickStatsResponse> {
    this.logger.info(`StatisticService.getTotalNewPatient()`);

    try {
      const newPatients = await this.prismaService.patient.findMany({
        where: {
          created_at: {
            gte: this.startOfCurrentMonth,
          },
        },
      });

      const newPatientsLastMonth = await this.prismaService.patient.findMany({
        where: {
          created_at: {
            gte: this.startOfLastMonth,
            lt: this.startOfCurrentMonth,
          },
        },
      });

      const totalNewPatient = newPatients.length;
      const totalNewPatientLastMonth = newPatientsLastMonth.length;

      let percentage = 0;
      if (totalNewPatientLastMonth === 0) {
        if (totalNewPatient > 0) percentage = 100;
      } else {
        percentage =
          ((totalNewPatient - totalNewPatientLastMonth) /
            totalNewPatientLastMonth) *
          100;
      }

      percentage = parseFloat(percentage.toFixed(2));

      return { total: totalNewPatient, percentage };
    } catch {
      this.logger.error(`Failed to get Total New Patient statistic`);
    }
  }

  async getDailyIncome(
    dto: GetDailyIncomeDto,
  ): Promise<GetDailyIncomeResponse> {
    this.logger.info(`StatisticService.getDailyIncome()`);

    try {
      const careSessions = await this.prismaService.careSession.findMany({
        where: {
          status: 'COMPLETED',
          created_at: {
            gte: dayjs(dto.startDate).startOf('day').toDate(),
            lte: dayjs(dto.endDate).endOf('day').toDate(),
          },
        },
        include: {
          CareSessionTreatment: {},
          DrugOrder: {},
        },
      });

      const sessionIncome = {};

      let currentDate = dayjs(dto.startDate);
      const endRangeDate = dayjs(dto.endDate);

      while (currentDate.isBefore(endRangeDate)) {
        sessionIncome[currentDate.format('YYYY-MM-DD')] = 0;
        currentDate = currentDate.add(1, 'day');
      }

      for (const session of careSessions) {
        const dateKey = dayjs(session.created_at).format('YYYY-MM-DD');
        let totalSessionPrice = 0;

        for (const treatment of session.CareSessionTreatment) {
          totalSessionPrice += treatment.applied_price * treatment.quantity;
        }

        for (const drugOrder of session.DrugOrder) {
          totalSessionPrice += drugOrder.applied_price * drugOrder.quantity;
        }

        if (sessionIncome[dateKey]) {
          sessionIncome[dateKey] += totalSessionPrice;
        } else {
          sessionIncome[dateKey] = totalSessionPrice;
        }
      }

      const finalIncomeArray = Object.keys(sessionIncome).map((date) => ({
        date: date,
        total: sessionIncome[date],
      }));

      return { data: finalIncomeArray };
    } catch {
      this.logger.error(`Failed to get Daily Income statistic`);
    }
  }
}
