import { HttpException, HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { handlePrismaError } from 'src/common/prisma-error.handler';
import { UserEvent } from 'src/user/event/user.event';
import { UserMapper } from 'src/user/mapper/user.mapper';
import { PasswordService } from 'src/user/password/password.service';
import { CreateUserDto } from 'src/user/user.model';
import { UserRepository } from 'src/user/user.repository';
import { UserService } from 'src/user/user.service';
import { UserValidationService } from 'src/user/validation/user-validation.service';

// Mock the prisma error handler for the entire test suite.
jest.mock('src/common/prisma-error.handler', () => ({
  handlePrismaError: jest.fn(),
}));

// --- MOCK DATA ---
const mockCreateUserDto: CreateUserDto = {
  username: 'testuser',
  email: 'test@example.com',
  role: UserRole.ADMIN,
};
const mockGeneratedPassword = 'generatedPassword123';
const mockHashedPassword = 'hashedPassword123';
const mockUserEntity: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  password: mockHashedPassword,
  role: UserRole.ADMIN,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let validationService: jest.Mocked<UserValidationService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  // Sets up a clean testing module before each test.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUserEntity),
            findPaginatedWithSearch: jest.fn(),
            findById: jest.fn(),
            findRawByEmail: jest.fn(),
            update: jest.fn(),
            deleteById: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            getStrategy: jest.fn().mockReturnValue({
              generate: jest.fn().mockReturnValue(mockGeneratedPassword),
            }),
          },
        },
        {
          provide: UserValidationService,
          useValue: {
            validateCreateDto: jest.fn().mockReturnValue(mockCreateUserDto),
            validateUpdateDto: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    passwordService = module.get(PasswordService);
    validationService = module.get(UserValidationService);
    eventEmitter = module.get(EventEmitter2);

    // Clear mock history before each test.
    (handlePrismaError as jest.Mock).mockClear();
  });

  describe('create()', () => {
    it('should successfully create a user', async () => {
      // Arrange
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(mockHashedPassword as never);

      // Act
      const result = await userService.create(mockCreateUserDto);

      // Assert
      expect(validationService.validateCreateDto).toHaveBeenCalledWith(
        mockCreateUserDto,
      );
      expect(passwordService.getStrategy).toHaveBeenCalledWith(UserRole.ADMIN);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockGeneratedPassword, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: mockHashedPassword,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(UserEvent.Created, {
        user: mockUserEntity,
        generatedPassword: mockGeneratedPassword,
      });
      expect(result).toEqual({
        user: expect.objectContaining({ id: '1', username: 'testuser' }),
      });
    });

    it('should throw conflict exception when email already exists', async () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the email',
        {
          code: 'P2002',
          clientVersion: 'test-version',
          meta: { target: ['email'] },
        },
      );
      userRepository.create.mockRejectedValue(prismaError);

      const mockedHandlePrismaError = handlePrismaError as jest.Mock;
      mockedHandlePrismaError.mockImplementation(() => {
        throw new HttpException(
          `Email ${mockCreateUserDto.email} sudah terdaftar`,
          HttpStatus.BAD_REQUEST,
        );
      });

      // Act & Assert
      await expect(userService.create(mockCreateUserDto)).rejects.toThrow(
        HttpException,
      );
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(
        prismaError,
        expect.any(Object),
        { P2002: `Email ${mockCreateUserDto.email} sudah terdaftar` },
      );
    });

    it('should handle password hashing failure', async () => {
      // Arrange
      const hashingError = new Error('Hashing failed');
      jest.spyOn(bcrypt, 'hash').mockRejectedValue(hashingError as never);

      // Act & Assert
      await expect(userService.create(mockCreateUserDto)).rejects.toThrow(
        hashingError,
      );
    });
  });

  describe('getAll()', () => {
    beforeEach(() => {
      // Spy on the static mapper method for these tests.
      jest.spyOn(UserMapper, 'toResponseDto').mockImplementation((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }));
    });

    it('should return a paginated list of users', async () => {
      // Arrange
      const mockUsers = [mockUserEntity];
      userRepository.findPaginatedWithSearch.mockResolvedValue([mockUsers, 1]);

      // Act
      const result = await userService.getAll(1, 10);

      // Assert
      expect(result.data.length).toBe(1);
      expect(result.meta.total_page).toBe(1);
    });

    it('should calculate metadata correctly for a middle page', async () => {
      // Arrange
      userRepository.findPaginatedWithSearch.mockResolvedValue([[], 25]);

      // Act
      const result = await userService.getAll(2, 10);

      // Assert
      expect(result.meta).toEqual({
        current_page: 2,
        previous_page: 1,
        next_page: 3,
        total_page: 3,
        total_data: 25,
      });
    });

    it('should handle an empty result', async () => {
      // Arrange
      userRepository.findPaginatedWithSearch.mockResolvedValue([[], 0]);

      // Act
      const result = await userService.getAll(1, 10);

      // Assert
      expect(result.data.length).toBe(0);
      expect(result.meta.total_data).toBe(0);
    });

    it('should default to page 1 if page number is invalid', async () => {
      // Arrange
      userRepository.findPaginatedWithSearch.mockResolvedValue([[], 0]);

      // Act
      const result = await userService.getAll(0, 10);

      // Assert
      expect(userRepository.findPaginatedWithSearch).toHaveBeenCalledWith(
        0,
        10,
        undefined,
      );
      expect(result.meta.current_page).toBe(1);
    });
  });

  describe('getById()', () => {
    it('should return a user DTO if found', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUserEntity);

      // Act
      const result = await userService.getById('1');

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(result.id).toBe(mockUserEntity.id);
    });

    it('should throw HttpException if user is not found', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getById('1')).rejects.toThrow(HttpException);
    });
  });

  describe('getRawByEmail()', () => {
    it('should return a user entity if found', async () => {
      // Arrange
      const expectedResult = { ...mockUserEntity };
      delete expectedResult.created_at;
      delete expectedResult.updated_at;
      userRepository.findRawByEmail.mockResolvedValue(mockUserEntity);
      jest.spyOn(UserMapper, 'toEntity').mockReturnValue(expectedResult);

      // Act
      const result = await userService.getRawByEmail(mockUserEntity.email);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should throw HttpException if user is not found', async () => {
      // Arrange
      userRepository.findRawByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getRawByEmail('none@none.com')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('update()', () => {
    it('should update a user and return the updated data', async () => {
      // Arrange
      const updateUserDto = { username: 'updated' };
      const updatedUser = { ...mockUserEntity, ...updateUserDto };
      validationService.validateUpdateDto.mockReturnValue(updateUserDto);
      userRepository.update.mockResolvedValue(updatedUser);
      jest.spyOn(UserMapper, 'toResponseDto').mockReturnValue(updatedUser);

      // Act
      const result = await userService.update('1', updateUserDto);

      // Assert
      expect(userRepository.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should handle error when user to update is not found', async () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found.',
        { code: 'P2025', clientVersion: 'test' },
      );
      userRepository.update.mockRejectedValue(prismaError);
      (handlePrismaError as jest.Mock).mockImplementation(() => {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      });

      // Act & Assert
      await expect(userService.update('1', {})).rejects.toThrow(HttpException);
      expect(handlePrismaError).toHaveBeenCalledWith(
        prismaError,
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe('delete()', () => {
    it('should delete a user and return a success message', async () => {
      // Arrange
      const userId = '1';
      userRepository.deleteById.mockResolvedValue(undefined);

      // Act
      const result = await userService.delete(userId);

      // Assert
      expect(userRepository.deleteById).toHaveBeenCalledWith(userId);
      expect(result).toBe(`Berhasil menghapus akun: ${userId}`);
    });

    it('should handle error when user to delete is not found', async () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record to delete not found.',
        { code: 'P2025', clientVersion: 'test' },
      );
      userRepository.deleteById.mockRejectedValue(prismaError);
      (handlePrismaError as jest.Mock).mockImplementation(() => {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      });

      // Act & Assert
      await expect(userService.delete('1')).rejects.toThrow(HttpException);
      expect(handlePrismaError).toHaveBeenCalledWith(
        prismaError,
        expect.any(Object),
        expect.any(Object),
      );
    });
  });
});
