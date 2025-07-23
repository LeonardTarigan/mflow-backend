import { Injectable } from '@nestjs/common';
import { ValidationService } from 'src/common/validation.service';

import { CreateUserDto, UpdateUserDto } from '../model/user.dto';
import { CreateUserSchema, UpdateUserSchema } from '../model/user.schema';

@Injectable()
export class UserValidationService {
  constructor(private readonly validationService: ValidationService) {}

  validateCreateDto(input: CreateUserDto): CreateUserDto {
    return this.validationService.validate<CreateUserDto>(
      CreateUserSchema,
      input,
    );
  }

  validateUpdateDto(input: UpdateUserDto): UpdateUserDto {
    return this.validationService.validate(UpdateUserSchema, input);
  }
}
