import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthLoginRequest, AuthResponse } from 'src/auth/auth.model';
import { ApiResponse } from 'src/common/api.model';
import { AuthService } from './auth.service';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() request: AuthLoginRequest,
  ): Promise<ApiResponse<AuthResponse>> {
    const result = await this.authService.login(request);

    return {
      data: result,
    };
  }
}
