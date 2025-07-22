import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestModule } from 'test/test.module';
import { AppModule } from '../../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { UserTestService } from './user.spec.service';
import { UserEntity } from 'src/user/user.model';

describe('UserController', () => {
  let app: INestApplication;
  let testService: UserTestService;
  let jwtService: JwtService;
  let token: string;
  let testUser: UserEntity;

  const API_ENDPOINT = '/api/users';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(UserTestService);
    jwtService = app.get(JwtService);

    token = jwtService.sign({
      sub: testService.TEST_USER_ID,
      email: testService.TEST_USER_EMAIL,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`POST ${API_ENDPOINT}`, () => {
    afterAll(async () => await testService.deleteUser(testUser.id));

    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).post(API_ENDPOINT).send({
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
        .post(API_ENDPOINT)
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

    it('should create new user', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: testService.TEST_USER_NAME,
          email: testService.TEST_USER_EMAIL,
          role: testService.TEST_USER_ROLE,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe(testService.TEST_USER_EMAIL);
      expect(res.body.error).toBeUndefined();

      testUser = res.body.data.user;
    });
  });

  describe(`GET ${API_ENDPOINT}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).get(API_ENDPOINT);

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to get all users data', async () => {
      const res = await request(app.getHttpServer())
        .get(API_ENDPOINT)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
      expect(res.body.error).toBeUndefined();
    });
  });

  describe(`PATCH ${API_ENDPOINT}`, () => {
    const NEW_USER_NAME = 'updated_name';
    const NEW_USER_ROLE = 'ADMIN';

    beforeAll(async () => {
      testUser = await testService.createUser();
      token = jwtService.sign({ sub: testUser.id, email: testUser.email });
    });

    afterAll(async () => {
      await testService.deleteUser(testUser.id);
    });

    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testUser.id}`)
        .send({
          username: NEW_USER_NAME,
          role: NEW_USER_ROLE,
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should return invalid UUID', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/invalid-uuid`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: NEW_USER_NAME,
          role: NEW_USER_ROLE,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should be rejected as validation error', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testUser.id}`)
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
        .patch(`${API_ENDPOINT}/${testUser.id}`)
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

  describe(`DELETE ${API_ENDPOINT}`, () => {
    beforeAll(async () => {
      testUser = await testService.createUser();
      token = jwtService.sign({ sub: testUser.id, email: testUser.email });
    });

    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).delete(
        `${API_ENDPOINT}/${testUser.id}`,
      );

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be invalid id data type', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_ENDPOINT}/invalid_id`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return invalid UUID', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_ENDPOINT}/invalid-uuid`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should delete the test record', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_ENDPOINT}/${testUser.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
    });
  });
});
