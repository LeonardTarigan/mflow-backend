import { $Enums } from '@prisma/client';

export class AddEmployeeClientRequest {
  name: string;
  email: string;
  phone: string;
  role: $Enums.EmployeeRole;
}

export class AddEmployeeServiceRequest extends AddEmployeeClientRequest {
  id: string;
  nip: string;
  password: string;
}

export class AddEmployeeResponse {
  nip: string;
  name: string;
  email: string;
  phone: string;
  role: $Enums.EmployeeRole;
  token?: string;
}
