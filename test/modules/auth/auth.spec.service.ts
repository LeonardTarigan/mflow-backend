import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class AuthTestService {
  constructor(private prismaService: PrismaService) {}

  readonly TEST_USER_ID = 'testing_id';
  readonly TEST_USER_NAME = 'testing_name';
  readonly TEST_USER_EMAIL = 'test@test.com';
  readonly TEST_USER_NIP = 'testing_nip';
  readonly TEST_USER_PHONE = 'testing_phone';
  readonly TEST_USER_ROLE = 'STAFF';
  readonly TEST_USER_PASSWORD = 'testing_password';

  async deleteUser() {
    if (!this.prismaService?.employee) {
      throw new Error('User model is undefined in PrismaService.');
    }

    await this.prismaService.employee.deleteMany({
      where: {
        name: this.TEST_USER_NAME,
      },
    });
  }

  async createUser() {
    await this.prismaService.employee.create({
      data: {
        id: this.TEST_USER_ID,
        name: this.TEST_USER_NAME,
        email: this.TEST_USER_EMAIL,
        nip: this.TEST_USER_NIP,
        phone: this.TEST_USER_PHONE,
        role: this.TEST_USER_ROLE,
        password: await bcrypt.hash(this.TEST_USER_PASSWORD, 10),
      },
    });
  }
}
