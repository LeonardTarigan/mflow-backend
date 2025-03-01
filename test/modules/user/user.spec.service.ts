import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class UserTestService {
  constructor(private prismaService: PrismaService) {}

  readonly TEST_USER_ID = 'testing_id';
  readonly TEST_USER_NAME = 'testing_name';
  readonly TEST_USER_EMAIL = 'test@mail.com';
  readonly TEST_USER_ROLE = 'ADMIN';
  readonly TEST_USER_PASSWORD = 'testing_password';

  async deleteUser() {
    if (!this.prismaService?.user) {
      throw new Error('User model is undefined in PrismaService.');
    }

    await this.prismaService.user.deleteMany({
      where: {
        username: this.TEST_USER_NAME,
      },
    });
  }
}
