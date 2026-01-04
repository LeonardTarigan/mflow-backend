export class GetQuickStatsResponse {
  total: number;
  percentage: number;
}

export class GetDailyIncomeDto {
  startDate: string;
  endDate: string;
}

export class DailyIncome {
  total: number;
  date: string;
}

export class GetDailyIncomeResponse {
  data: DailyIncome[];
}
