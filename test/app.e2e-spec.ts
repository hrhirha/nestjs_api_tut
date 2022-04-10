import { INestApplication, ValidationPipe } from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';

describe ('App e2e', () => {
  let prisma: PrismaService;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }));
    await app.init();
    await app.listen(4000);

    prisma = await app.get(PrismaService);
    prisma.cleanDB();
    pactum.request.setBaseUrl('http://127.0.0.1:4000');
  });

  afterAll(() => {
    app.close()
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'user1@mail.tld',
      password: 'pass1',
    };

    describe('Signup', () => {
      it('should signup', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should signin', () => {
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(200).stores('userAT', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      pactum.spec().get('/users/me').withHeaders({Authorization: 'Bearer $S{userAT}',}).expectStatus(200);
    });

    describe('Edit user', () => {
      const dto: EditUserDto = {
        email: 'jdoe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      it('should edit user', () => {
        return pactum.spec().patch('/users').withHeaders({Authorization: 'Bearer $S{userAT}',}).withBody(dto).expectStatus(200).inspect();
      });
    });
  });
  
  describe('Bookmarks', () => {
    describe('Create bookmark', () => {});
    describe('Get bookmarks', () => {});
    describe('Get bookmar by id', () => {});
    describe('Edit bookmark', () => {});
    describe('Delete bookmark', () => {});
  });
});