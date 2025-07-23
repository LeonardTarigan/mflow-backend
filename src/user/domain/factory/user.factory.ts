import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class UserFactory {
  constructor(private prismaService: PrismaService) {}

  async create(
    overrides: Partial<User> = {},
  ): Promise<{ user: User; plainTextPassword: string }> {
    const plainTextPassword = 'password123';

    const defaultData = {
      username: 'default_test_user',
      email: `user-${Date.now()}@test.com`,
      role: UserRole.STAFF,
      password: await bcrypt.hash(plainTextPassword, 10),
    };

    const user = await this.prismaService.user.create({
      data: { ...defaultData, ...overrides },
    });

    return { user, plainTextPassword };
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
