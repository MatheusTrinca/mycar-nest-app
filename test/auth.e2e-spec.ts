import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;
  const emailBase = 'test@test.com';
  let response: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: emailBase, password: 'password' })
      .expect(201);
  });

  it('should handles a signup request ', async () => {
    const { id, email } = response.body;
    expect(id).toBeDefined();
    expect(email).toEqual(emailBase);
  });

  it('should signup a new user then get the currently logged in user ', async () => {
    const cookie = response.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(emailBase);
  });

  it('should signout a user ', async () => {
    const cookie = response.get('Set-Cookie');

    await request(app.getHttpServer())
      .post('/auth/signout')
      .set('Cookie', cookie)
      .expect(200);

    const newRequest = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie);

    expect(newRequest.get('Set-Cookie')).toBeUndefined();
  });

  it('should find as user by id ', async () => {
    const cookie = response.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get(`/auth/${response.body.id}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(emailBase);
  });

  it('should update a user ', async () => {
    const cookie = response.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .patch(`/auth/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ email: 'teste2@test.com' })
      .expect(200);

    expect(body.email).toEqual('teste2@test.com');
  });

  it('should delete a user ', async () => {
    const cookie = response.get('Set-Cookie');

    await request(app.getHttpServer())
      .delete(`/auth/${response.body.id}`)
      .set('Cookie', cookie)
      .expect(200);

    const { body } = await request(app.getHttpServer())
      .get(`/auth/${response.body.id}`)
      .set('Cookie', cookie)
      .expect(404);

    expect(body.email).toBeUndefined();
  });
});
