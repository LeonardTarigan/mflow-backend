import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { Public } from 'src/auth/domain/decorators/public.decorator';
import { ApiResponse } from 'src/common/api.model';

import {
  DailyIncome,
  GetQuickStatsResponse,
} from './domain/model/statistic.model';
import { StatisticService } from './statistic.service';

@Controller('/api/statistics')
export class StatisticController {
  constructor(private statisticService: StatisticService) {}

  @Public()
  @Get('/visits')
  @HttpCode(HttpStatus.OK)
  async getTodaysVisit(): Promise<ApiResponse<GetQuickStatsResponse>> {
    const data = await this.statisticService.getTodaysVisit();

    return {
      data,
    };
  }

  @Public()
  @Get('/patients/total')
  @HttpCode(HttpStatus.OK)
  async getTotalRegisteredPatient(): Promise<
    ApiResponse<GetQuickStatsResponse>
  > {
    const data = await this.statisticService.getTotalRegisteredPatient();

    return {
      data,
    };
  }

  @Public()
  @Get('/patients/new')
  @HttpCode(HttpStatus.OK)
  async getTotalNewPatient(): Promise<ApiResponse<GetQuickStatsResponse>> {
    const data = await this.statisticService.getTotalNewPatient();

    return {
      data,
    };
  }

  @Public()
  @Get('/incomes')
  @HttpCode(HttpStatus.OK)
  async getDailyIncome(
    @Query('startDate')
    startDate: string,
    @Query('endDate')
    endDate: string,
  ): Promise<ApiResponse<DailyIncome[]>> {
    const data = await this.statisticService.getDailyIncome({
      startDate,
      endDate,
    });

    return data;
  }
}
