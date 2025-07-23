import { User } from '@prisma/client';

import { UserEntity, UserResponseDto } from '../user.model';

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
