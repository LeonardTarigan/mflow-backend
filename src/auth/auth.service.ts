import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthLoginDto, AuthLoginResponse } from 'src/auth/auth.model';
import { ValidationService } from 'src/common/validation.service';
import { UserService } from 'src/user/user.service';
import { Logger } from 'winston';
import { AuthValidation } from './auth.validation';

@Injectable()
export class AuthService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(dto: AuthLoginDto): Promise<AuthLoginResponse> {
    this.logger.info(`AuthService.login(${JSON.stringify(dto)})`);

    const validatedReq = this.validationService.validate<AuthLoginDto>(
      AuthValidation.LOGIN,
      dto,
    );

    const user = await this.userService.getFullDataByEmail(validatedReq.email);

    if (!user)
      throw new HttpException(
        'Email atau password salah!',
        HttpStatus.UNAUTHORIZED,
      );

    const isPasswordValid = await bcrypt?.compare(
      validatedReq.password,
      user.password,
    );

    if (!isPasswordValid)
      throw new HttpException(
        'Email atau password salah!',
        HttpStatus.UNAUTHORIZED,
      );

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token: accessToken,
    };
  }
}
