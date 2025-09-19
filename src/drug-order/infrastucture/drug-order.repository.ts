import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DrugOrder, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class DrugOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithStockUpdate(
    orderData: Prisma.DrugOrderUncheckedCreateInput,
    drugId: number,
    quantity: number,
    applied_price: number,
  ): Promise<DrugOrder> {
    return this.prisma.$transaction(async (tx) => {
      const drug = await tx.drug.findUnique({ where: { id: drugId } });

      if (!drug)
        throw new HttpException(
          'Data obat tidak ditemukan',
          HttpStatus.NOT_FOUND,
        );

      const createdOrder = await tx.drugOrder.create({
        data: {
          ...orderData,
          applied_price,
        },
      });

      await tx.drug.update({
        where: { id: drugId },
        data: {
          stock: drug.stock - quantity,
        },
      });

      return createdOrder;
    });
  }

  async deleteByIdWithStockUpdate(id: number): Promise<DrugOrder> {
    return this.prisma.$transaction(async (tx) => {
      const drug = await tx.drug.findUnique({ where: { id } });

      if (!drug)
        throw new HttpException(
          'Data obat tidak ditemukan',
          HttpStatus.NOT_FOUND,
        );

      const deletedOrder = await tx.drugOrder.delete({
        where: { id },
      });

      await tx.drug.update({
        where: { id: id },
        data: {
          stock: drug.stock - deletedOrder.quantity,
        },
      });

      return deletedOrder;
    });
  }
}
