import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/api.model';

import { AuthService } from './auth.service';
import { Public } from './domain/decorators/public.decorator';
import { AuthLoginDto, AuthLoginResponse } from './domain/model/auth.dto';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: AuthLoginDto,
  ): Promise<ApiResponse<AuthLoginResponse>> {
    const result = await this.authService.login(dto);

    return {
      data: result,
    };
  }
}
