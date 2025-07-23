import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { UserRole } from '@prisma/client';
import { ResponseMeta } from 'src/common/api.model';

export class UserEntity {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  password: string;
}

export class CreateUserDto extends OmitType(UserEntity, ['id', 'password']) {}

export class UpdateUserDto extends PartialType(
  PickType(UserEntity, ['username', 'role']),
) {}

export class UserResponseDto extends OmitType(UserEntity, ['password']) {}

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
