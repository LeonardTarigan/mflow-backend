import { Injectable } from '@nestjs/common';
import { ValidationService } from 'src/common/validation.service';

import { AuthLoginDto } from '../model/auth.dto';
import { AuthLoginSchema } from '../model/auth.schema';

@Injectable()
export class AuthValidationService {
  constructor(private readonly validationService: ValidationService) {}

  validateLoginDto(input: AuthLoginDto): AuthLoginDto {
    return this.validationService.validate<AuthLoginDto>(
      AuthLoginSchema,
      input,
    );
  }
}
