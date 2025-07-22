import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestModule } from 'test/test.module';
import { AppModule } from '../../../src/app.module';
import { AuthTestService } from './auth.spec.service';
import { UserDetail } from 'src/user/user.model';

describe('AuthController', () => {
  let app: INestApplication;
  let testService: AuthTestService;
  let testUser: UserDetail;

  const API_ENDPOINT = '/api/auth/login';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(AuthTestService);
  });

  beforeEach(async () => {
    testUser = await testService.createUser();
  });

  afterEach(async () => {
    if (testUser) {
      await testService.deleteUser(testUser.id);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`POST ${API_ENDPOINT}`, () => {
    it('should be rejected as validation error', async () => {
      const res = await request(app.getHttpServer()).post(API_ENDPOINT).send({
        email: '',
        password: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to login', async () => {
      const res = await request(app.getHttpServer()).post(API_ENDPOINT).send({
        email: testUser.email,
        password: testService.TEST_USER_PASSWORD,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.error).toBeUndefined();
    });
  });
});
