export class AuthLoginRequest {
  nip: string;
  password: string;
}

export class AuthResponse {
  nip: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  token?: string;
}
