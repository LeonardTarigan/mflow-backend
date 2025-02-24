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
    });

    it('should be able to login', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testService.TEST_USER_EMAIL,
          password: testService.TEST_USER_PASSWORD,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testService.TEST_USER_EMAIL);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.error).toBeUndefined();

      token = res.body.data.token;
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should not be authorized', async () => {
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
      expect(res.body.data.user.email).toBe(testService.TEST_USER_EMAIL);
      expect(res.body.data.token).toBeNull();
      expect(res.body.error).toBeUndefined();
    });
  });
});
