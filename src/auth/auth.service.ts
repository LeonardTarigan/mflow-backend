import { HttpException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as brcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthLoginDto, AuthResponse } from 'src/auth/auth.model';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { AuthValidation } from './auth.validation';

@Injectable()
export class AuthService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: AuthLoginDto): Promise<AuthResponse> {
    this.logger.info(`AuthService.login(${JSON.stringify(dto)})`);

    const loginRequest = this.validationService.validate<AuthLoginDto>(
      AuthValidation.LOGIN,
      dto,
    );

    let user = await this.prismaService.employee.findUnique({
      where: {
        nip: loginRequest.nip,
      },
    });

    if (!user) throw new HttpException('NIP atau password salah!', 401);

    const isPasswordValid = await brcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordValid)
      throw new HttpException('NIP atau password salah!', 401);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.name,
    });

    user = await this.prismaService.employee.update({
      where: {
        nip: loginRequest.nip,
      },
      data: {
        token: accessToken,
      },
    });

    return {
      nip: user.nip,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: user.token,
    };
  }

  async logout(id: string): Promise<AuthResponse> {
    this.logger.info(`AuthService.logout(${id})`);

    const user = await this.prismaService.employee.update({
      where: {
        id: id,
      },
      data: {
        token: null,
      },
    });

    return {
      nip: user.nip,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: user.token,
    };
  }
}
