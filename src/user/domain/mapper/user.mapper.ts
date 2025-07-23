import { User } from '@prisma/client';

import { UserResponseDto } from '../model/user.dto';
import { UserEntity } from '../model/user.schema';

export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  static toEntity(user: User): UserEntity {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      password: user.password,
    };
  }
}
