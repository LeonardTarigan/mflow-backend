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

  const API_ENDPOINT = '/api/rooms';

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
    await app.close();
  });

  describe(`POST ${API_ENDPOINT}`, () => {
    let testRoomId: number;

    afterAll(async () => await testService.deleteTestRoom(testRoomId));

    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).post(API_ENDPOINT).send({
        name: testService.TEST_ROOM_NAME,
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be rejected as validation error', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to create test record', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: testService.TEST_ROOM_NAME,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe(testService.TEST_ROOM_NAME);
      expect(res.body.error).toBeUndefined();

      testRoomId = res.body.data.id;
    });
  });

  describe(`GET ${API_ENDPOINT}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).get(API_ENDPOINT);

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to get all rooms data', async () => {
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
    let testRoomId: number;

    beforeAll(async () => {
      const testRoom = await testService.createTestRoom();
      testRoomId = testRoom.id;
    });

    afterAll(async () => await testService.deleteTestRoom(testRoomId));

    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testRoomId}`)
        .send({
          name: testService.TEST_ROOM_NAME,
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should not be found', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/0`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: testService.TEST_ROOM_NAME,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('should be rejected as validation error', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testRoomId}`)
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
        .patch(`${API_ENDPOINT}/${testRoomId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: NEW_ROOM_NAME,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(NEW_ROOM_NAME);
      expect(res.body.error).toBeUndefined();
    });
  });

  describe(`DELETE ${API_ENDPOINT}`, () => {
    let testRoomId: number;

    beforeAll(async () => {
      const testRoom = await testService.createTestRoom();
      testRoomId = testRoom.id;
    });

    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).delete(
        `${API_ENDPOINT}/${testRoomId}`,
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

    it('should not be found', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_ENDPOINT}/0`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('should delete the test record', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_ENDPOINT}/${testRoomId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
    });
  });
});
