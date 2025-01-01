import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthLoginRequest, AuthResponse } from 'src/auth/auth.model';
import { ApiResponse } from 'src/common/api.model';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: AuthLoginRequest,
  ): Promise<ApiResponse<AuthResponse>> {
    const result = await this.authService.login(request);

    return {
      data: result,
    };
  }
}
