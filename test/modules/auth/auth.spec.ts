import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestModule } from 'test/test.module';
import { AppModule } from '../../../src/app.module';
import { AuthTestService } from './auth.spec.service';

describe('AuthController', () => {
  let app: INestApplication;
  let testService: AuthTestService;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(AuthTestService);

    await testService.deleteUser();
    await testService.createUser();
  });

  afterAll(async () => {
    await testService.deleteUser();
  });

  describe('POST /api/auth/login', () => {
    it('should be rejected as validation error', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          nip: '',
          password: '',
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toBe(
        'nip: String must contain at least 1 character(s), password: String must contain at least 1 character(s)',
      );
    });

    it('should be able to login', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          nip: testService.TEST_USER_NIP,
          password: testService.TEST_USER_PASSWORD,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe(testService.TEST_USER_NAME);
      expect(res.body.data.token).toBeDefined();

      token = res.body.data.token;
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should be not authorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .send({
          id: testService.TEST_USER_ID,
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to logout', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          id: testService.TEST_USER_ID,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe(testService.TEST_USER_NAME);
      expect(res.body.data.token).toBeNull();
    });
  });
});
