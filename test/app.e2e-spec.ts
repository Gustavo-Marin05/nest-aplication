import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { execSync } from 'child_process';
import * as fs from 'fs';
import { AppModule } from './../src/app.module';

const TEST_DB = './prisma/e2e-test.db';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: `file:${TEST_DB}` },
      cwd: process.cwd(),
      stdio: 'pipe',
    });
    process.env.DATABASE_URL = `file:${TEST_DB}`;
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET / should return Hello World!', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  let cookie: string;

  describe('Auth', () => {
    const user = { email: 'e2e@test.com', password: 'Password123!' };

    it('POST /register should register user and set cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/register')
        .send(user)
        .expect(201);

      expect(res.body.message).toBe('Usuario registrado y autenticado');
      expect(res.headers['set-cookie']).toBeDefined();
      cookie = res.headers['set-cookie'][0];
    });

    it('POST /login should login and set cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/login')
        .send(user)
        .expect(201);

      expect(res.body.message).toBe('Login exitoso');
      expect(res.headers['set-cookie']).toBeDefined();
      cookie = res.headers['set-cookie'][0];
    });

    it('GET /profile with valid cookie should return user', async () => {
      const res = await request(app.getHttpServer())
        .get('/profile')
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(user.email);
    });

    it('GET /profile without cookie should return 401', async () => {
      await request(app.getHttpServer()).get('/profile').expect(401);
    });

    it('POST /logout should clear cookie', async () => {
      const res = await request(app.getHttpServer()).post('/logout').expect(201);

      expect(res.body.message).toBe('Sesión cerrada');
    });
  });

  describe('Tasks', () => {
    let taskId: number;

    beforeAll(() => {
      const user = { email: 'taskuser@test.com', password: 'Pass123!' };
      const moduleFixture = Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      return moduleFixture.then((m) => {
        const a = m.createNestApplication();
        a.use(cookieParser());
        return a.init().then(() => {
          return request(a.getHttpServer())
            .post('/register')
            .send(user)
            .then((regRes) => {
              cookie = regRes.headers['set-cookie'][0];
              return a.close();
            });
        });
      });
    });

    it('POST /task should create a task', async () => {
      const res = await request(app.getHttpServer())
        .post('/task')
        .set('Cookie', cookie)
        .send({ title: 'E2E Task', description: 'E2E Description' })
        .expect(201);

      expect(res.body.title).toBe('E2E Task');
      expect(res.body.description).toBe('E2E Description');
      taskId = res.body.id;
    });

    it('GET /task should list tasks', async () => {
      const res = await request(app.getHttpServer())
        .get('/task')
        .set('Cookie', cookie)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /task/:id should return single task', async () => {
      const res = await request(app.getHttpServer())
        .get(`/task/${taskId}`)
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body.id).toBe(taskId);
      expect(res.body.title).toBe('E2E Task');
    });

    it('PUT /task/:id should update task', async () => {
      const res = await request(app.getHttpServer())
        .put(`/task/${taskId}`)
        .set('Cookie', cookie)
        .send({ title: 'Updated E2E Task' })
        .expect(200);

      expect(res.body.title).toBe('Updated E2E Task');
    });

    it('DELETE /task/:id should delete task', async () => {
      await request(app.getHttpServer())
        .delete(`/task/${taskId}`)
        .set('Cookie', cookie)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/task/${taskId}`)
        .set('Cookie', cookie)
        .expect(400);
    });
  });
});
