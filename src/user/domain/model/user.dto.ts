import { createZodDto } from 'nestjs-zod/dto';
import { ResponseMeta } from 'src/common/api.model';

import {
  CreateUserSchema,
  UpdateUserSchema,
  UserResponseSchema,
} from './user.schema';

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
export class UserResponseDto extends createZodDto(UserResponseSchema) {}

export class CreateUserResponse {
  user: UserResponseDto;
}

export class GetUserResponse {
  user: UserResponseDto;
}

export class GetAllUsersResponse {
  data: UserResponseDto[];
  meta: ResponseMeta;
}
