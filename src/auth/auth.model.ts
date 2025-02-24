import { UserRole } from '@prisma/client';

export class AuthLoginDto {
  email: string;
  password: string;
}

export class AuthData {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export class AuthResponse {
  user: AuthData;
  token?: string;
}
