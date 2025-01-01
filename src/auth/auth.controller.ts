import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthLoginDto, AuthResponse } from 'src/auth/auth.model';
import { ApiResponse } from 'src/common/api.model';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthLoginDto): Promise<ApiResponse<AuthResponse>> {
    const result = await this.authService.login(dto);

    return {
      data: result,
    };
  }
}
