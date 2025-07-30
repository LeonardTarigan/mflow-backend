import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';

import { CreateDrugDto } from './domain/model/drug.model';
import { DrugService } from './drug.service';
import { DrugRepository } from './infrastucture/drug.repository';

// Mock the external error handler at the top level
jest.mock('src/common/prisma-error.handler', () => ({
  handlePrismaError: jest.fn(),
}));

describe('DrugService', () => {
  let service: DrugService;
  let repository: jest.Mocked<DrugRepository>;

  // --- MOCK DATA ---
  const mockDrug = {
    id: 1,
    name: 'Paracetamol',
    amount_sold: 0,
    unit: 'strip',
    price: 5000,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateDto: CreateDrugDto = {
    name: 'Paracetamol',
    unit: 'strip',
    price: 5000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrugService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { info: jest.fn(), error: jest.fn() },
        },
        {
          provide: DrugRepository,
          useValue: {
            create: jest.fn(),
            findMany: jest.fn(),
            findManyWithPagination: jest.fn(),
            update: jest.fn(),
            deleteById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DrugService>(DrugService);
    repository = module.get(DrugRepository);

    // Clear the mock's history before each test
    (handlePrismaError as jest.Mock).mockClear();
  });

  // --- TESTS ---

  describe('create()', () => {
    it('should create a drug successfully', async () => {
      // Arrange
      repository.create.mockResolvedValue(mockDrug);

      // Act
      const result = await service.create(mockCreateDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockDrug);
    });

    it('should handle duplicate drug name errors', async () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: 'test',
      });
      repository.create.mockRejectedValue(prismaError);
      (handlePrismaError as jest.Mock).mockImplementation((err) => {
        throw err;
      });

      // Act & Assert
      await expect(service.create(mockCreateDto)).rejects.toThrow(prismaError);
      expect(handlePrismaError).toHaveBeenCalled();
    });
  });

  describe('getAll()', () => {
    it('should return a paginated list of drugs', async () => {
      // Arrange
      const mockDrugs = [mockDrug];
      // This scenario tests a simple case where there's only one page.
      repository.findManyWithPagination.mockResolvedValue([mockDrugs, 1]);

      // Act
      const result = await service.getAll(1, 10);

      // Assert
      expect(repository.findManyWithPagination).toHaveBeenCalledWith(
        0,
        10,
        undefined,
      );
      expect(result.data[0]).toEqual(mockDrug);
      expect(result.meta.total_data).toBe(1);
      expect(result.meta.total_page).toBe(1);
    });

    it('should calculate metadata correctly for a middle page', async () => {
      // Arrange
      const totalData = 30;
      const pageNumber = 2;
      const pageSize = 10;
      const expectedOffset = 10;
      repository.findManyWithPagination.mockResolvedValue([
        [mockDrug],
        totalData,
      ]);

      // Act
      const result = await service.getAll(pageNumber, pageSize);

      // Assert
      expect(repository.findManyWithPagination).toHaveBeenCalledWith(
        expectedOffset,
        pageSize,
        undefined,
      );
      expect(result.meta).toEqual({
        current_page: pageNumber,
        previous_page: 1,
        next_page: 3,
        total_page: 3,
        total_data: totalData,
      });
    });

    it('should return all drugs when pageSize is not provided', async () => {
      // Arrange
      const mockDrugs = [mockDrug, { ...mockDrug, id: 2, name: 'Amoxicillin' }];
      repository.findMany.mockResolvedValue([mockDrugs, 2]);

      // Act
      const result = await service.getAll(1);

      // Assert
      expect(repository.findMany).toHaveBeenCalled();
      expect(repository.findManyWithPagination).not.toHaveBeenCalled();
      expect(result.data.length).toBe(2);
    });

    it('should handle an empty result', async () => {
      // Arrange
      repository.findManyWithPagination.mockResolvedValue([[], 0]);

      // Act
      const result = await service.getAll(1, 10);

      // Assert
      expect(result.data.length).toBe(0);
      expect(result.meta.total_data).toBe(0);
    });

    it('should default to page 1 if page number is invalid', async () => {
      // Arrange
      repository.findManyWithPagination.mockResolvedValue([[], 0]);

      // Act
      const result = await service.getAll(0, 10);

      // Assert
      expect(repository.findManyWithPagination).toHaveBeenCalledWith(
        0,
        10,
        undefined,
      );
      expect(result.meta.current_page).toBe(1);
    });
  });

  describe('update()', () => {
    it('should update a drug successfully', async () => {
      // Arrange
      const updateDto = { name: 'Ibuprofen' };
      const updatedDrug = { ...mockDrug, ...updateDto };
      repository.update.mockResolvedValue(updatedDrug);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedDrug);
    });

    it('should handle not found errors on update', async () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: 'test',
      });
      repository.update.mockRejectedValue(prismaError);
      (handlePrismaError as jest.Mock).mockImplementation((err) => {
        throw err;
      });

      // Act & Assert
      await expect(service.update(999, {})).rejects.toThrow(prismaError);
      expect(handlePrismaError).toHaveBeenCalled();
    });
  });

  describe('delete()', () => {
    it('should delete a drug and return a success message', async () => {
      // Arrange
      const drugId = 1;
      repository.deleteById.mockResolvedValue(undefined);

      // Act
      const result = await service.delete(drugId);

      // Assert
      expect(repository.deleteById).toHaveBeenCalledWith(drugId);
      expect(result).toBe(`Berhasil menghapus obat: ${drugId}`);
    });

    it('should handle not found errors on delete', async () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: 'test',
      });
      repository.deleteById.mockRejectedValue(prismaError);
      (handlePrismaError as jest.Mock).mockImplementation((err) => {
        throw err;
      });

      // Act & Assert
      await expect(service.delete(999)).rejects.toThrow(prismaError);
      expect(handlePrismaError).toHaveBeenCalled();
    });
  });
});
