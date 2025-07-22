import { OmitType, PickType } from '@nestjs/mapped-types';
import { UserDetail } from 'src/user/user.model';

export class AuthLoginDto extends PickType(UserDetail, ['email', 'password']) {}

export class AuthData extends OmitType(UserDetail, ['password']) {}

export class AuthLoginResponse {
  user: AuthData;
  token: string;
}
