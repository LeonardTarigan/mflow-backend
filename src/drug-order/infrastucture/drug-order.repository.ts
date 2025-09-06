import { Injectable } from '@nestjs/common';
import { DrugOrder, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class DrugOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DrugOrderUncheckedCreateInput): Promise<DrugOrder> {
    return this.prisma.drugOrder.create({ data });
  }
}
