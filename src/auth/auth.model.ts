import { $Enums } from '@prisma/client';

export class AuthLoginDto {
  nip: string;
  password: string;
}

export class AuthData {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  role: $Enums.EmployeeRole;
}

export class AuthResponse {
  user: AuthData;
  token?: string;
}
