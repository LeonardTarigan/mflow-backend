import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/models/api.model';
import { AuthLoginRequest, AuthResponse } from 'src/models/auth.model';

@Controller('/api/employees')
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
