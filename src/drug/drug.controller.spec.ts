import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Drug } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { UserFactory } from 'src/user/domain/factory/user.factory';
import * as request from 'supertest';

import { DrugFactory } from './domain/factory/drug.factory';

describe('DrugController (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let drugFactory: DrugFactory;
  let jwtService: JwtService;
  let authToken: string;

  const API_ENDPOINT = '/api/drugs';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory, DrugFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userFactory = app.get(UserFactory);
    drugFactory = app.get(DrugFactory);
    jwtService = app.get(JwtService);

    // Create one user to generate a token for all tests
    const { user } = await userFactory.create({ role: 'ADMIN' });
    authToken = jwtService.sign({ sub: user.id, role: user.role });
  });

  afterAll(async () => {
    // Clean up the user created for the token
    const decodedToken = jwtService.decode(authToken) as { sub: string };
    await userFactory.delete(decodedToken.sub);
    await app.close();
  });

  // --- POST /api/drugs ---
  describe(`POST ${API_ENDPOINT}`, () => {
    const drugsToDelete: number[] = [];

    afterEach(async () => {
      for (const id of drugsToDelete) {
        await drugFactory.delete(id);
      }
      drugsToDelete.length = 0;
    });

    it('should fail without an auth token (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .send({ name: 'Aspirin', unit: 'Tablet', price: 5000 });

      expect(res.status).toBe(401);
    });

    it('should fail with a validation error for invalid data (400 Bad Request)', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });

    it('should create a new drug successfully', async () => {
      const createDto = { name: 'Aspirin', unit: 'Tablet', price: 5000 };
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto);

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe(createDto.name);
      drugsToDelete.push(res.body.data.id);
    });
  });

  // --- GET /api/drugs ---
  describe(`GET ${API_ENDPOINT}`, () => {
    let testDrug: Drug;

    beforeEach(async () => {
      testDrug = await drugFactory.create();
    });

    afterEach(async () => {
      await drugFactory.delete(testDrug.id);
    });

    it('should get a paginated list of drugs', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_ENDPOINT}?page=1&pageSize=10`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
    });

    it('should get all drugs when pageSize is not provided', async () => {
      const res = await request(app.getHttpServer())
        .get(API_ENDPOINT)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.total_page).toBeNull();
    });
  });

  // --- PATCH /api/drugs/:id ---
  describe(`PATCH ${API_ENDPOINT}/:id`, () => {
    let testDrug: Drug;

    beforeEach(async () => {
      testDrug = await drugFactory.create();
    });

    afterEach(async () => {
      await drugFactory.delete(testDrug.id).catch(() => {});
    });

    it('should return 404 for a non-existent drug ID', async () => {
      const nonExistentId = 999999;
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'updated-drug-name' });

      expect(res.status).toBe(404);
    });

    it('should update a drug successfully', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testDrug.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'updated-drug-name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('updated-drug-name');
    });
  });

  // --- DELETE /api/drugs/:id ---
  describe(`DELETE ${API_ENDPOINT}/:id`, () => {
    let testDrug: Drug;

    beforeEach(async () => {
      testDrug = await drugFactory.create();
    });

    afterEach(async () => {
      await drugFactory.delete(testDrug.id).catch(() => {});
    });

    it('should return 404 for a non-existent drug ID', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_ENDPOINT}/999999`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should delete a drug successfully', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_ENDPOINT}/${testDrug.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });
});
