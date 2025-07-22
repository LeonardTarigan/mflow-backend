import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestModule } from 'test/test.module';

import { AppModule } from '../../../src/app.module';

import { RoomTestService } from './room.spec.service';

describe('RoomController', () => {
  let app: INestApplication;
  let testService: RoomTestService;
  let jwtService: JwtService;
  let token: string;
  let testRecordId: number;

  const path = '/api/rooms';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(RoomTestService);
    jwtService = app.get(JwtService);

    token = jwtService.sign({
      sub: 'testing_sub',
      name: 'testing_name',
    });
  });

  afterAll(async () => {
    await testService.deleteRoom();
  });

  describe(`POST ${path}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).post(path).send({
        name: testService.TEST_ROOM_NAME,
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be rejected as validation error', async () => {
      const res = await request(app.getHttpServer())
        .post(path)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to create test record', async () => {
      const res = await request(app.getHttpServer())
        .post(path)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: testService.TEST_ROOM_NAME,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe(testService.TEST_ROOM_NAME);
      expect(res.body.error).toBeUndefined();

      testRecordId = res.body.data.id;
    });
  });

  describe(`GET ${path}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).get(path);

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to get all rooms data', async () => {
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
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${path}/${testRecordId}`)
        .send({
          name: testService.TEST_ROOM_NAME,
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should not be found', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${path}/0`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: testService.TEST_ROOM_NAME,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('should be rejected as validation error', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${path}/${testRecordId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should update name', async () => {
      const NEW_ROOM_NAME = 'updated_name';

      const res = await request(app.getHttpServer())
        .patch(`${path}/${testRecordId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: NEW_ROOM_NAME,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(NEW_ROOM_NAME);
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
        .delete(`${path}/0`)
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
