import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestModule } from 'test/test.module';
import { AppModule } from '../../../src/app.module';
import { DrugTestService } from './drug.spec.service';
import { JwtService } from '@nestjs/jwt';

describe('DrugController', () => {
  let app: INestApplication;
  let testService: DrugTestService;
  let jwtService: JwtService;
  let token: string;
  let testDrugId: number;

  const path = '/api/drugs';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(DrugTestService);
    jwtService = app.get(JwtService);

    token = jwtService.sign({
      sub: testService.TEST_DRUG_UNIT,
      name: testService.TEST_DRUG_NAME,
    });
  });

  afterAll(async () => {
    await testService.deleteDrug();
  });

  describe(`POST ${path}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).post(path).send({
        name: testService.TEST_DRUG_NAME,
        unit: testService.TEST_DRUG_UNIT,
        price: testService.TEST_DRUG_PRICE,
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
          unit: -1,
          price: -1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to create new drug', async () => {
      const res = await request(app.getHttpServer())
        .post(path)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: testService.TEST_DRUG_NAME,
          unit: testService.TEST_DRUG_UNIT,
          price: testService.TEST_DRUG_PRICE,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe(testService.TEST_DRUG_NAME);
      expect(res.body.error).toBeUndefined();

      testDrugId = res.body.data.id;
    });
  });

  describe(`GET ${path}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).get(path);

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to get all drugs data', async () => {
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
        .patch(`${path}/${testDrugId}`)
        .send({
          name: testService.TEST_DRUG_NAME,
          unit: testService.TEST_DRUG_UNIT,
          price: testService.TEST_DRUG_PRICE,
          amount_sold: testService.TEST_DRUG_AMOUNT_SOLD,
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should not be found', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${path}/0`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: testService.TEST_DRUG_NAME,
          unit: testService.TEST_DRUG_UNIT,
          price: testService.TEST_DRUG_PRICE,
          amount_sold: testService.TEST_DRUG_AMOUNT_SOLD,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('should be rejected as validation error', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${path}/${testDrugId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
          unit: -1,
          price: -1,
          amount_sold: -1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should update name, unit, price, and amount sold', async () => {
      const NEW_DRUG_NAME = 'updated_name';
      const NEW_DRUG_UNIT = 'updated_unit';
      const NEW_DRUG_PRICE = 20_000;
      const NEW_DRUG_AMOUNT_SOLD = 320;

      const res = await request(app.getHttpServer())
        .patch(`${path}/${testDrugId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: NEW_DRUG_NAME,
          unit: NEW_DRUG_UNIT,
          price: NEW_DRUG_PRICE,
          amount_sold: NEW_DRUG_AMOUNT_SOLD,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(NEW_DRUG_NAME);
      expect(res.body.data.unit).toBe(NEW_DRUG_UNIT);
      expect(res.body.data.price).toBe(NEW_DRUG_PRICE);
      expect(res.body.data.amount_sold).toBe(NEW_DRUG_AMOUNT_SOLD);
      expect(res.body.error).toBeUndefined();
    });
  });

  describe(`DELETE ${path}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).delete(
        `${path}/${testDrugId}`,
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

    it('should delete the drug', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${path}/${testDrugId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBe('Successfully deleted: ' + testDrugId);
      expect(res.body.error).toBeUndefined();
    });
  });
});
