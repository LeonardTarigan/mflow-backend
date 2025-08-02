import { randomUUID } from 'crypto';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

import { UserFactory } from './domain/factory/user.factory';

describe('UserController (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let jwtService: JwtService;

  const API_ENDPOINT = '/api/users';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userFactory = app.get(UserFactory);
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`POST ${API_ENDPOINT}`, () => {
    let adminToken: string;
    const usersToDelete: string[] = []; // Keep track of users to clean up

    beforeAll(() => {
      // Create a single token for an admin user for all tests in this block
      adminToken = jwtService.sign({ sub: randomUUID(), role: 'ADMIN' });
    });

    afterEach(async () => {
      // Clean up any users created during the tests
      for (const id of usersToDelete) {
        await userFactory.delete(id).catch(() => {}); // Ignore errors if user was already deleted
      }
      usersToDelete.length = 0; // Reset the array
    });

    it('should not be authorized without a token', async () => {
      const res = await request(app.getHttpServer()).post(API_ENDPOINT).send({
        username: 'test_user',
        email: 'test@mail.com',
        role: 'ADMIN',
      });
      expect(res.status).toBe(401);
    });

    it('should be rejected for validation errors', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: '' }); // Invalid payload

      expect(res.status).toBe(400);
    });

    it('should create a new user successfully', async () => {
      const newUserEmail = 'new.user@test.com';
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'new_test_user',
          email: newUserEmail,
          role: 'USER',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe(newUserEmail);

      // Add the created user's ID to the list for cleanup
      if (res.body.data.user.id) {
        usersToDelete.push(res.body.data.user.id);
      }
    });
  });

  // ✨ REFACTORED: GET /api/users
  describe(`GET ${API_ENDPOINT}`, () => {
    let adminToken: string;
    let testUser: User;

    // Use beforeEach and afterEach for perfect isolation
    beforeEach(async () => {
      const res = await userFactory.create({ role: 'ADMIN' });
      testUser = res.user;
      adminToken = jwtService.sign({ sub: testUser.id, role: testUser.role });
    });

    afterEach(async () => {
      await userFactory.delete(testUser.id);
    });

    it('should not be authorized without a token', async () => {
      const res = await request(app.getHttpServer()).get(API_ENDPOINT);
      expect(res.status).toBe(401);
    });

    it('should get all users data', async () => {
      // We know a user exists because beforeEach created one
      const res = await request(app.getHttpServer())
        .get(API_ENDPOINT)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ✨ REFACTORED: PATCH /api/users/:id
  describe(`PATCH ${API_ENDPOINT}/:id`, () => {
    let adminToken: string;
    let testUser: User;

    beforeEach(async () => {
      const res = await userFactory.create({ role: 'ADMIN' });
      testUser = res.user;
      adminToken = jwtService.sign({ sub: testUser.id, role: testUser.role });
    });

    afterEach(async () => {
      await userFactory.delete(testUser.id);
    });

    it('should update username and role', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'updated_name', role: 'USER' });

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe('updated_name');
      expect(res.body.data.role).toBe('USER');
    });

    it('should return 400 for an invalid UUID', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/invalid-uuid`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'any' });

      expect(res.status).toBe(400);
    });
  });

  describe(`DELETE ${API_ENDPOINT}/:id`, () => {
    let adminToken: string;
    let userToDelete: User;

    beforeEach(async () => {
      const res = await userFactory.create({ role: 'ADMIN' });
      userToDelete = res.user;
      // Assume the deleting user is an admin
      adminToken = jwtService.sign({ sub: randomUUID(), role: 'ADMIN' });
    });

    // Note: No afterEach needed here, as the test itself performs the deletion

    it('should delete the test record', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_ENDPOINT}/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Optional: Verify the user is actually gone
      const findRes = await request(app.getHttpServer())
        .get(`${API_ENDPOINT}/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(findRes.status).toBe(404);
    });
  });
});
