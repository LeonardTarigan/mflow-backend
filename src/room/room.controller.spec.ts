import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Room } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { UserFactory } from 'src/user/domain/factory/user.factory';
import * as request from 'supertest';

import { RoomFactory } from './domain/factory/room.factory';

describe('RoomController (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let roomFactory: RoomFactory;
  let jwtService: JwtService;
  let authToken: string;

  const API_ENDPOINT = '/api/rooms';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory, RoomFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userFactory = app.get(UserFactory);
    roomFactory = app.get(RoomFactory);
    jwtService = app.get(JwtService);

    const authService = app.get(AuthService);

    const { user, plainTextPassword } = await userFactory.create({
      role: 'ADMIN',
    });

    const loginResponse = await authService.login({
      email: user.email,
      password: plainTextPassword,
    });

    authToken = loginResponse.token;
  });

  afterAll(async () => {
    const decodedToken = jwtService.decode(authToken) as { sub: string };
    await userFactory.delete(decodedToken.sub);
    await app.close();
  });

  // --- POST /api/rooms ---
  describe(`POST ${API_ENDPOINT}`, () => {
    const roomsToDelete: number[] = [];

    afterEach(async () => {
      for (const id of roomsToDelete) {
        await roomFactory.delete(id);
      }
      roomsToDelete.length = 0;
    });

    it('should fail without an auth token (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .send({ name: 'Kamar Melati' });

      expect(res.status).toBe(401);
    });

    it('should fail with a validation error for invalid data (400 Bad Request)', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });

    it('should create a new room successfully', async () => {
      const createDto = { name: 'Kamar Mawar' };
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto);

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe(createDto.name);
      roomsToDelete.push(res.body.data.id);
    });
  });

  // --- GET /api/rooms ---
  describe(`GET ${API_ENDPOINT}`, () => {
    let testRoom: Room;

    beforeEach(async () => {
      testRoom = await roomFactory.create();
    });

    afterEach(async () => {
      await roomFactory.delete(testRoom.id);
    });

    it('should fail without an auth token (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer()).get(API_ENDPOINT);
      expect(res.status).toBe(401);
    });

    it('should get a paginated list of rooms', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_ENDPOINT}?page=1&pageSize=10`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
    });

    it('should get all rooms when pageSize is not provided', async () => {
      const res = await request(app.getHttpServer())
        .get(API_ENDPOINT)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.total_page).toBeNull();
    });
  });

  // --- PATCH /api/rooms/:id ---
  describe(`PATCH ${API_ENDPOINT}/:id`, () => {
    let testRoom: Room;

    beforeEach(async () => {
      testRoom = await roomFactory.create();
    });

    afterEach(async () => {
      await roomFactory.delete(testRoom.id).catch(() => {});
    });

    it('should fail without an auth token (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testRoom.id}`)
        .send({ name: 'updated-room-name' });
      expect(res.status).toBe(401);
    });

    it('should return 404 for a non-existent room ID', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/999999`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'updated-room-name' });

      expect(res.status).toBe(404);
    });

    it('should update a room successfully', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testRoom.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'updated-room-name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('updated-room-name');
    });
  });

  // --- DELETE /api/rooms/:id ---
  describe(`DELETE ${API_ENDPOINT}/:id`, () => {
    let testRoom: Room;

    beforeEach(async () => {
      testRoom = await roomFactory.create();
    });

    afterEach(async () => {
      await roomFactory.delete(testRoom.id).catch(() => {});
    });

    it('should fail without an auth token (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer()).delete(
        `${API_ENDPOINT}/${testRoom.id}`,
      );
      expect(res.status).toBe(401);
    });

    it('should return 404 for a non-existent room ID', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_ENDPOINT}/999999`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should delete a room successfully', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_ENDPOINT}/${testRoom.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });
});
