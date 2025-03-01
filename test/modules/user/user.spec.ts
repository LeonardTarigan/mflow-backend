import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestModule } from 'test/test.module';
import { AppModule } from '../../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { UserTestService } from './user.spec.service';

describe('UserController', () => {
  let app: INestApplication;
  let testService: UserTestService;
  let jwtService: JwtService;
  let token: string;
  let testRecordId: string;

  const path = '/api/users';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(UserTestService);
    jwtService = app.get(JwtService);

    token = jwtService.sign({
      sub: 'testing_sub',
      name: 'testing_name',
    });
  });

  afterAll(async () => {
    await testService.deleteUser();
  });

  describe(`POST ${path}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).post(path).send({
        id: testService.TEST_USER_ID,
        username: testService.TEST_USER_NAME,
        email: testService.TEST_USER_EMAIL,
        role: testService.TEST_USER_ROLE,
        password: testService.TEST_USER_PASSWORD,
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be rejected as validation error', async () => {
      const res = await request(app.getHttpServer())
        .post(path)
        .set('Authorization', `Bearer ${token}`)
        .send({
          id: '',
          name: '',
          email: '',
          role: '',
          password: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to create test record', async () => {
      const res = await request(app.getHttpServer())
        .post(path)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: testService.TEST_USER_NAME,
          email: testService.TEST_USER_EMAIL,
          role: testService.TEST_USER_ROLE,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe(testService.TEST_USER_EMAIL);
      expect(res.body.error).toBeUndefined();

      testRecordId = res.body.data.user.id;
    });
  });

  describe(`GET ${path}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).get(path);

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to get all users data', async () => {
      const res = await request(app.getHttpServer())
        .get(path)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
      expect(res.body.error).toBeUndefined();
    });
  });

  describe(`PATCH ${path}`, () => {
    const NEW_USER_NAME = 'updated_name';
    const NEW_USER_ROLE = 'ADMIN';

    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${path}/${testRecordId}`)
        .send({
          username: NEW_USER_NAME,
          role: NEW_USER_ROLE,
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should not be found', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${path}/invalid-uuid`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: NEW_USER_NAME,
          role: NEW_USER_ROLE,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('should be rejected as validation error', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${path}/${testRecordId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: '',
          role: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should update username and role', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${path}/${testRecordId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: NEW_USER_NAME,
          role: NEW_USER_ROLE,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe(NEW_USER_NAME);
      expect(res.body.error).toBeUndefined();
    });
  });

  describe(`DELETE ${path}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).delete(
        `${path}/${testRecordId}`,
      );

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be invalid id data type', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${path}/invalid_id`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should not be found', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${path}/invalid-uuid`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('should delete the test record', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${path}/${testRecordId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBe('Successfully deleted: ' + testRecordId);
      expect(res.body.error).toBeUndefined();
    });
  });
});
