import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/common/prisma.service';
import { UserEntity } from 'src/user/user.model';

@Injectable()
export class AuthTestService {
  constructor(private prismaService: PrismaService) {}

  readonly TEST_USER_NAME = 'testing_name';
  readonly TEST_USER_EMAIL = 'test@test.com';
  readonly TEST_USER_ROLE = 'STAFF';
  readonly TEST_USER_PASSWORD = 'testing_password';

  async deleteUser(id: string): Promise<void> {
    if (!this.prismaService?.user) {
      throw new Error('User model is undefined in PrismaService.');
    }

    await this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }

  async createUser(): Promise<UserEntity> {
    const user = await this.prismaService.user.create({
      data: {
        username: this.TEST_USER_NAME,
        email: this.TEST_USER_EMAIL,
        role: this.TEST_USER_ROLE,
        password: await bcrypt.hash(this.TEST_USER_PASSWORD, 10),
      },
    });

    return user;
  }
}
