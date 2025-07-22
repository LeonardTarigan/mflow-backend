import { OmitType, PickType } from '@nestjs/mapped-types';
import { UserEntity } from 'src/user/user.model';

export class AuthLoginDto extends PickType(UserEntity, ['email', 'password']) {}

export class AuthData extends OmitType(UserEntity, ['password']) {}

export class AuthLoginResponse {
  user: AuthData;
  token: string;
}
