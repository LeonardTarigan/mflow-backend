import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';

import { CreateRoomDto } from './domain/model/room.model';
import { RoomRepository } from './infrastructure/room.repository';
import { RoomService } from './room.service';

// Mock the external error handler
jest.mock('src/common/prisma-error.handler', () => ({
  handlePrismaError: jest.fn(),
}));

describe('RoomService', () => {
  let service: RoomService;
  let repository: jest.Mocked<RoomRepository>;

  // --- MOCK DATA ---
  const mockRoom = {
    id: 1,
    name: 'Mock Room',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateDto: CreateRoomDto = {
    name: 'Mock Room',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { info: jest.fn(), error: jest.fn() },
        },
        {
          provide: RoomRepository,
          useValue: {
            create: jest.fn(),
            findManyWithPagination: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            deleteById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    repository = module.get(RoomRepository);

    (handlePrismaError as jest.Mock).mockClear();
  });

  // --- TESTS ---

  describe('create()', () => {
    it('should create a room successfully', async () => {
      // Arrange
      repository.create.mockResolvedValue(mockRoom);

      // Act
      const result = await service.create(mockCreateDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockRoom);
    });

    it('should handle duplicate room name errors', async () => {
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
    it('should return a paginated list of rooms when pageSize is provided', async () => {
      // Arrange
      const mockRooms = [mockRoom];
      repository.findManyWithPagination.mockResolvedValue([mockRooms, 1]);

      // Act
      const result = await service.getAll(1, 10);

      // Assert
      expect(repository.findManyWithPagination).toHaveBeenCalledWith(
        0,
        10,
        undefined,
      );
      expect(result.data[0]).toEqual(mockRoom);
      expect(result.meta.total_page).toBe(1);
    });

    it('should calculate metadata correctly for a middle page', async () => {
      // Arrange
      const totalData = 25;
      const pageNumber = 2;
      const pageSize = 10;
      repository.findManyWithPagination.mockResolvedValue([
        [mockRoom],
        totalData,
      ]);

      // Act
      const result = await service.getAll(pageNumber, pageSize);

      // Assert
      expect(result.meta).toEqual({
        current_page: pageNumber,
        previous_page: 1,
        next_page: 3,
        total_page: 3,
        total_data: totalData,
      });
    });

    it('should return all rooms when pageSize is not provided', async () => {
      // Arrange
      const mockRooms = [mockRoom, { ...mockRoom, id: 2 }];
      repository.findMany.mockResolvedValue([mockRooms, 2]);

      // Act
      const result = await service.getAll(1, undefined);

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
      const result = await service.getAll(-1, 10);

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
    it('should update a room successfully', async () => {
      // Arrange
      const updateDto = { name: 'Kamar Anggrek' };
      const updatedRoom = { ...mockRoom, ...updateDto };
      repository.update.mockResolvedValue(updatedRoom);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedRoom);
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
    it('should delete a room and return a success message', async () => {
      // Arrange
      const roomId = 1;
      repository.deleteById.mockResolvedValue(undefined);

      // Act
      const result = await service.delete(roomId);

      // Assert
      expect(repository.deleteById).toHaveBeenCalledWith(roomId);
      expect(result).toBe(`Berhasil menghapus ruangan: ${roomId}`);
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
