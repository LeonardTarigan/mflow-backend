import { Injectable } from '@nestjs/common';
import { Drug, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class DrugFactory {
  constructor(private prismaService: PrismaService) {}

  async create(data: Partial<Prisma.DrugCreateInput> = {}): Promise<Drug> {
    const defaultData: Prisma.DrugCreateInput = {
      name: `Test Drug ${Date.now()}`,
      unit: 'Tablet',
      price: 10000,
      amount_sold: 0,
      ...data,
    };
    return this.prismaService.drug.create({ data: defaultData });
  }

  async delete(id: number): Promise<void> {
    await this.prismaService.drug.delete({ where: { id } }).catch(() => {});
  }
}
