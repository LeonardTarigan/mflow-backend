import { UserRole } from '@prisma/client';
import { ResponseMeta } from 'src/common/api.model';

class BaseUser {
  username: string;
  email: string;
  role: UserRole;
}

export class AddUserDto extends BaseUser {}

export class AddUserRequest extends BaseUser {
  id: string;
  password: string;
}

export class UserDetail extends BaseUser {
  id: string;
  password?: string;
}

export class AddUserResponse {
  user: UserDetail;
  token?: string;
}

export class GetAllUserResponse {
  data: UserDetail[];
  meta: ResponseMeta;
}

export class UpdateUserDto {
  username?: string;
  role?: UserRole;
}
