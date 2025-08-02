import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Patient } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { UserFactory } from 'src/user/domain/factory/user.factory';
import * as request from 'supertest';

import { PatientFactory } from './domain/factory/patient.factory';

describe('PatientController (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let patientFactory: PatientFactory;
  let jwtService: JwtService;
  let authToken: string;

  const API_ENDPOINT = '/api/patients';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory, PatientFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userFactory = app.get(UserFactory);
    patientFactory = app.get(PatientFactory);
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

  // --- POST /api/patients ---
  describe(`POST ${API_ENDPOINT}`, () => {
    const patientsToDelete: string[] = [];

    afterEach(async () => {
      for (const id of patientsToDelete) {
        await patientFactory.delete(id);
      }
      patientsToDelete.length = 0;
    });

    it('should fail without an auth token (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .send({});
      expect(res.status).toBe(401);
    });

    it('should fail with a validation error for invalid data (400 Bad Request)', async () => {
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('should create a new patient successfully', async () => {
      const createDto = {
        name: 'John Doe',
        nik: '1234567890123456',
        birth_date: '1995-05-20',
        address: 'Jl. Testing',
        occupation: 'Software Engineer',
        phone_number: '6281234567890',
        gender: 'MALE',
      };
      const res = await request(app.getHttpServer())
        .post(API_ENDPOINT)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto);
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe(createDto.name);
      patientsToDelete.push(res.body.data.id);
    });
  });

  // --- GET /api/patients ---
  describe(`GET ${API_ENDPOINT}`, () => {
    let testPatient: Patient;

    beforeEach(async () => {
      testPatient = await patientFactory.create();
    });

    afterEach(async () => {
      await patientFactory.delete(testPatient.id);
    });

    it('should fail without an auth token (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer()).get(API_ENDPOINT);
      expect(res.status).toBe(401);
    });

    it('should get a paginated list of patients', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_ENDPOINT}?page=1&pageSize=10`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
    });

    it('should get all patients when pageSize is not provided', async () => {
      const res = await request(app.getHttpServer())
        .get(API_ENDPOINT)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.total_page).toBeNull();
    });
  });

  // --- GET /api/patients/:mrNumber ---
  describe(`GET ${API_ENDPOINT}/:mrNumber`, () => {
    let testPatient: Patient;

    beforeEach(async () => {
      testPatient = await patientFactory.create({
        medical_record_number: '99.99.99',
      });
    });

    afterEach(async () => {
      await patientFactory.delete(testPatient.id);
    });

    it('should fail without an auth token (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer()).get(
        `${API_ENDPOINT}/${testPatient.medical_record_number}`,
      );
      expect(res.status).toBe(401);
    });

    it('should get a patient by their MRN', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_ENDPOINT}/${testPatient.medical_record_number}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testPatient.id);
    });

    it('should return 404 for a non-existent MRN', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_ENDPOINT}/MRN-XXXXX`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });
  });

  // --- PATCH /api/patients/:id ---
  describe(`PATCH ${API_ENDPOINT}/:id`, () => {
    let testPatient: Patient;

    beforeEach(async () => {
      testPatient = await patientFactory.create();
    });

    afterEach(async () => {
      await patientFactory.delete(testPatient.id);
    });

    it('should fail without an auth token (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testPatient.id}`)
        .send({ name: 'updated' });
      expect(res.status).toBe(401);
    });

    it('should return 404 for a non-existent patient ID', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${crypto.randomUUID()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'updated-patient-name' });
      expect(res.status).toBe(404);
    });

    it('should update a patient successfully', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_ENDPOINT}/${testPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'updated-patient-name' });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('updated-patient-name');
    });
  });
});
