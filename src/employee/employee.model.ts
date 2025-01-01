import { EmployeeRole } from '@prisma/client';

export class AddEmployeeDto {
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
}

export class AddEmployeeRequest extends AddEmployeeDto {
  id: string;
  nip: string;
  password: string;
}

export class AddEmployeeResponse {
  nip: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  token?: string;
}
