import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

import { AuthLoginDto } from './domain/model/auth.dto';
import { AuthValidationService } from './domain/validation/auth-validation.service';

// Mock the external bcryptjs library
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let validationService: jest.Mocked<AuthValidationService>;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  // --- MOCK DATA ---
  const mockLoginDto: AuthLoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUser = {
    id: 'user-id-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPasswordFromDb',
    role: UserRole.ADMIN,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockToken = 'mock.jwt.token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService, // The real service we are testing
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { info: jest.fn(), error: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn() },
        },
        {
          provide: UserService,
          useValue: { getRawByEmail: jest.fn() },
        },
        {
          provide: AuthValidationService,
          useValue: { validateLoginDto: jest.fn() },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    validationService = module.get(AuthValidationService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe('login()', () => {
    it('should return a user and token on successful login', async () => {
      // Arrange
      validationService.validateLoginDto.mockReturnValue(mockLoginDto);
      userService.getRawByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await authService.login(mockLoginDto);

      // Assert
      expect(validationService.validateLoginDto).toHaveBeenCalledWith(
        mockLoginDto,
      );
      expect(userService.getRawByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
        email: mockUser.email,
      });
      expect(result.token).toBe(mockToken);
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw an UNAUTHORIZED HttpException if user is not found', async () => {
      // Arrange
      validationService.validateLoginDto.mockReturnValue(mockLoginDto);
      userService.getRawByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        new HttpException(
          'Email atau password salah!',
          HttpStatus.UNAUTHORIZED,
        ),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw an UNAUTHORIZED HttpException if password does not match', async () => {
      // Arrange
      validationService.validateLoginDto.mockReturnValue(mockLoginDto);
      userService.getRawByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        new HttpException(
          'Email atau password salah!',
          HttpStatus.UNAUTHORIZED,
        ),
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should re-throw an error from the validation service', async () => {
      // Arrange
      const validationError = new HttpException(
        'Validation Failed',
        HttpStatus.BAD_REQUEST,
      );
      validationService.validateLoginDto.mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        validationError,
      );
      expect(userService.getRawByEmail).not.toHaveBeenCalled();
    });
  });
});
