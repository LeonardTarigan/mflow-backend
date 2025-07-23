import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthLoginDto } from 'src/auth/auth.model';
import { AuthService } from 'src/auth/auth.service';
import { ValidationService } from 'src/common/validation.service';
import { UserService } from 'src/user/user.service';

// Mock the bcrypt library
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let validationService: jest.Mocked<ValidationService>;
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
    password: 'hashedPassword', // This is the hashed password from the DB
    role: UserRole.ADMIN,
  };

  const mockToken = 'mock.jwt.token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ValidationService,
          useValue: { validate: jest.fn() },
        },
        {
          provide: UserService,
          useValue: { getRawByEmail: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn() },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { info: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    validationService = module.get(ValidationService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);

    // Clear mock history before each test
    jest.clearAllMocks();
  });

  describe('login()', () => {
    it('should return a user and token on successful login', async () => {
      // Arrange
      validationService.validate.mockReturnValue(mockLoginDto);
      userService.getRawByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await authService.login(mockLoginDto);

      // Assert
      expect(validationService.validate).toHaveBeenCalled();
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
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
        },
        token: mockToken,
      });
    });

    it('should throw an UNAUTHORIZED HttpException if user is not found', async () => {
      // Arrange
      validationService.validate.mockReturnValue(mockLoginDto);
      userService.getRawByEmail.mockResolvedValue(null); // Simulate user not found

      // Act & Assert
      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        HttpException,
      );
      await expect(authService.login(mockLoginDto)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });

      // Ensure subsequent functions were not called
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw an UNAUTHORIZED HttpException if password does not match', async () => {
      // Arrange
      validationService.validate.mockReturnValue(mockLoginDto);
      userService.getRawByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Simulate password mismatch

      // Act & Assert
      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        HttpException,
      );
      await expect(authService.login(mockLoginDto)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });

      // Ensure JWT service was not called
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should re-throw an error from the validation service', async () => {
      // Arrange
      const validationError = new HttpException(
        'Validation Failed',
        HttpStatus.BAD_REQUEST,
      );
      validationService.validate.mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        validationError,
      );

      // Ensure no other services were called
      expect(userService.getRawByEmail).not.toHaveBeenCalled();
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
