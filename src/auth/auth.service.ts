import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserService } from 'src/user/user.service';
import { Logger } from 'winston';

import { AuthLoginDto, AuthLoginResponse } from './domain/model/auth.dto';
import { AuthValidationService } from './domain/validation/auth-validation.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private jwtService: JwtService,
    private userService: UserService,
    private validationService: AuthValidationService,
  ) {}

  async login(dto: AuthLoginDto): Promise<AuthLoginResponse> {
    this.logger.info(`AuthService.login(${JSON.stringify(dto)})`);

    const validDto = this.validationService.validateLoginDto(dto);

    const user = await this.userService.getRawByEmail(validDto.email);

    if (!user)
      throw new HttpException(
        'Email atau password salah!',
        HttpStatus.UNAUTHORIZED,
      );

    const isPasswordValid = await bcrypt?.compare(
      validDto.password,
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
