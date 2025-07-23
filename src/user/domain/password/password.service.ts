import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import {
  AdminPasswordStrategy,
  DoctorPasswordStrategy,
  IPasswordStrategy,
  PharmacistPasswordStrategy,
  StaffPasswordStrategy,
} from './password.strategy';

@Injectable()
export class PasswordService {
  private readonly strategies: Record<UserRole, IPasswordStrategy> = {
    ADMIN: new AdminPasswordStrategy(),
    DOKTER: new DoctorPasswordStrategy(),
    FARMASI: new PharmacistPasswordStrategy(),
    STAFF: new StaffPasswordStrategy(),
  };

  getStrategy(role: UserRole): IPasswordStrategy {
    const strategy = this.strategies[role.toUpperCase()];
    return strategy;
  }
}
