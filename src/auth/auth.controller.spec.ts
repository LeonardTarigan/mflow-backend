import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from 'src/app.module';
import { UserFactory } from 'src/user/domain/factory/user.factory';
import * as request from 'supertest';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let testUser: User;
  let plainTextPassword: string;

  const API_ENDPOINT = '/api/auth/login';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();

    userFactory = app.get(UserFactory);
  });

  beforeEach(async () => {
    const result = await userFactory.create();
    testUser = result.user;
    plainTextPassword = result.plainTextPassword;
  });

  afterEach(async () => {
    if (testUser) {
      await userFactory.delete(testUser.id);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`POST ${API_ENDPOINT}`, () => {
    it('should be rejected for validation errors', async () => {
      const res = await request(app.getHttpServer()).post(API_ENDPOINT).send({
        email: 'not-an-email',
        password: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should log in successfully with correct credentials', async () => {
      const res = await request(app.getHttpServer()).post(API_ENDPOINT).send({
        email: testUser.email,
        password: plainTextPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with incorrect credentials', async () => {
      const res = await request(app.getHttpServer()).post(API_ENDPOINT).send({
        email: testUser.email,
        password: 'wrong-password',
      });

      expect(res.status).toBe(401);
    });
  });
});
