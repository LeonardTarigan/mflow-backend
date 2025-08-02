import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { handlePrismaError } from 'src/common/prisma-error.handler';

import { CreatePatientDto } from './domain/model/patient.model';
import { PatientRepository } from './infrastucture/patient.repository';
import { PatientService } from './patient.service';

// Mock the external error handler
jest.mock('src/common/prisma-error.handler', () => ({
  handlePrismaError: jest.fn(),
}));

describe('PatientService', () => {
  let service: PatientService;
  let repository: jest.Mocked<PatientRepository>;

  // --- MOCK DATA ---
  const mockCreateDto: CreatePatientDto = {
    name: 'Jessica Wong',
    nik: '9993827312710921',
    birth_date: new Date('2001-10-12'),
    address: 'Jl. Dieng',
    occupation: 'Pegawai Swasta',
    phone_number: '6289129219213',
    gender: 'FEMALE',
  };

  const mockPatient = {
    id: 'patient-id-1',
    medical_record_number: '99.99.99',
    email: 'jessica@test.com',
    created_at: new Date(),
    updated_at: new Date(),
    ...mockCreateDto,
  };

  type CreatePatientPayload = Omit<CreatePatientDto, 'birth_date'> & {
    birth_date: string;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { info: jest.fn(), error: jest.fn() },
        },
        {
          provide: PatientRepository,
          useValue: {
            create: jest.fn(),
            findManyWithPagination: jest.fn(),
            findMany: jest.fn(),
            findByMrNumber: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    repository = module.get(PatientRepository);

    (handlePrismaError as jest.Mock).mockClear();
  });

  // --- TESTS ---

  describe('create()', () => {
    it(' should successfully create a user ', async () => {
      // Arrange
      const dtoWithDateIsoString: CreatePatientPayload = {
        ...mockCreateDto,
        birth_date: new Date(mockCreateDto.birth_date).toISOString(),
      };
      repository.create.mockResolvedValue(mockPatient);

      // Act
      const result = await service.create(mockCreateDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(dtoWithDateIsoString);
      expect(result).toEqual(mockPatient);
    });

    it('should handle duplicate NIK errors', async () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['nik'] },
      });
      repository.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(service.create(mockCreateDto)).rejects.toThrow(
        new HttpException('NIK sudah terdaftar!', HttpStatus.BAD_REQUEST),
      );
    });

    it('should handle duplicate MR number errors', async () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['medical_record_number'] },
      });
      repository.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(service.create(mockCreateDto)).rejects.toThrow(
        new HttpException(
          'Nomor Rekam Medis sudah terdaftar!',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('getAll()', () => {
    it('should return a paginated list of patients', async () => {
      // Arrange
      repository.findManyWithPagination.mockResolvedValue([[mockPatient], 1]);

      // Act
      const result = await service.getAll(1, 10);

      // Assert
      expect(repository.findManyWithPagination).toHaveBeenCalledWith(
        0,
        10,
        undefined,
      );
      expect(result.data[0]).toEqual(mockPatient);
      expect(result.meta.total_page).toBe(1);
    });

    it('should calculate metadata correctly for a middle page', async () => {
      // Arrange
      const totalData = 30; // 3 pages of results
      repository.findManyWithPagination.mockResolvedValue([
        [mockPatient],
        totalData,
      ]);

      // Act
      const result = await service.getAll(2, 10);

      // Assert
      expect(result.meta).toEqual({
        current_page: 2,
        previous_page: 1,
        next_page: 3,
        total_page: 3,
        total_data: totalData,
      });
    });

    it('should return all patients when pageSize is not provided', async () => {
      // Arrange
      const mockPatients = [
        mockPatient,
        { ...mockPatient, id: 'patient-id-2' },
      ];
      repository.findMany.mockResolvedValue([mockPatients, 2]);

      // Act
      const result = await service.getAll(1, undefined);

      // Assert
      expect(repository.findMany).toHaveBeenCalled();
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

  describe('getByMrNumber()', () => {
    it('should return a patient by their MRN', async () => {
      // Arrange
      const mrNumber = 'MRN123';
      repository.findByMrNumber.mockResolvedValue(mockPatient);

      // Act
      const result = await service.getByMrNumber(mrNumber);

      // Assert
      expect(repository.findByMrNumber).toHaveBeenCalledWith(mrNumber);
      expect(result).toEqual(mockPatient);
    });

    it('should throw HttpException if patient is not found', async () => {
      // Arrange
      repository.findByMrNumber.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getByMrNumber('not-found')).rejects.toThrow(
        new HttpException('Data pasien tidak ditemukan!', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update()', () => {
    it('should update a patient successfully', async () => {
      // Arrange
      const updateDto = { name: 'Jessica Doe' };
      const updatedPatient = { ...mockPatient, ...updateDto };
      repository.update.mockResolvedValue(updatedPatient);

      // Act
      const result = await service.update('patient-id-1', updateDto);

      // Assert
      expect(repository.update).toHaveBeenCalledWith('patient-id-1', updateDto);
      expect(result).toEqual(updatedPatient);
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
      await expect(service.update('not-found', {})).rejects.toThrow(
        prismaError,
      );
      expect(handlePrismaError).toHaveBeenCalled();
    });
  });
});
