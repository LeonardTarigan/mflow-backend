import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../../../src/app.module';

import { DrugTestService } from './drug.spec.service';

describe('DrugController', () => {
  let app: INestApplication;
  let testService: DrugTestService;
  let jwtService: JwtService;
  let token: string;

  const API_ENDPOINT = '/api/drugs';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(DrugTestService);
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
    let testDrugId: number;

    afterAll(async () => await testService.deleteTestDrug(testDrugId));

    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).post(API_ENDPOINT).send({
        name: testService.TEST_DRUG_NAME,
        unit: testService.TEST_DRUG_UNIT,
        price: testService.TEST_DRUG_PRICE,
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
          unit: -1,
          price: -1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to create test record', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
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

  describe(`GET ${API_ENDPOINT}`, () => {
    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).get(API_ENDPOINT);

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should be able to get all drugs data', async () => {
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
    let testDrugId: number;

    beforeAll(async () => {
      const testDrug = await testService.createTestDrug();
      testDrugId = testDrug.id;
    });

    afterAll(async () => await testService.deleteTestDrug(testDrugId));

    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testDrugId}`)
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
        .patch(`${API_ENDPOINT}/0`)
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
        .patch(`${API_ENDPOINT}/${testDrugId}`)
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
        .patch(`${API_ENDPOINT}/${testDrugId}`)
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

  describe(`DELETE ${API_ENDPOINT}`, () => {
    let testDrugId: number;

    beforeAll(async () => {
      const testDrug = await testService.createTestDrug();
      testDrugId = testDrug.id;
    });

    it('should not be authorized', async () => {
      const res = await request(app.getHttpServer()).delete(
        `${API_ENDPOINT}/${testDrugId}`,
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
        .delete(`${API_ENDPOINT}/${testDrugId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
    });
  });
});
