import { EmployeeRole } from '@prisma/client';
import { ResponseMeta } from 'src/common/api.model';

class BaseEmployee {
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
}

export class AddEmployeeDto extends BaseEmployee {}

export class AddEmployeeRequest extends BaseEmployee {
  id: string;
  nip: string;
  password: string;
}

export class EmployeeDetail extends BaseEmployee {
  id: string;
  nip: string;
}

export class AddEmployeeResponse {
  user: EmployeeDetail;
  token?: string;
}

export class GetAllEmployeeResponse {
  data: EmployeeDetail[];
  meta: ResponseMeta;
}

export class UpdateEmployeeDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: EmployeeRole;
}
