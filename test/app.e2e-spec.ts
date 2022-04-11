import { INestApplication, ValidationPipe } from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

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
    describe('Get current user', () => {
      pactum.spec().get('/users/me').withHeaders({Authorization: 'Bearer $S{userAT}',}).expectStatus(200);
    });

    describe('Edit user', () => {
      const dto: EditUserDto = {
        email: 'jdoe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      it('should edit user', () => {
        return pactum.spec().patch('/users').withHeaders({Authorization: 'Bearer $S{userAT}',}).withBody(dto).expectStatus(200);
      });
    });
  });
  
  describe('Bookmarks', () => {
    const dto: CreateBookmarkDto = {
      title: 'first bookmark',
      link: 'first-bookmark.link'
    }
    describe('Create bookmark', () => {
      it('should create bookmark', () => {
          return pactum.spec().post('/bookmarks').withHeaders({Authorization: 'Bearer $S{userAT}',}).withBody(dto).expectStatus(201).stores('bmId', 'id');
        });
      });
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({Authorization: 'Bearer $S{userAT}',}).expectStatus(200);
      });
    });
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum.spec().get('/bookmarks/$S{bmId}').withHeaders({Authorization: 'Bearer $S{userAT}',}).expectStatus(200);
      });
    });
    describe('Edit bookmark', () => {
      const dto : EditBookmarkDto = {
        title: 'first bookmark\'s new title',
        description: 'adding a description to the first bookmark'
      };
      it('should edit bookmark by id', () => {
        return pactum.spec().patch('/bookmarks/$S{bmId}').withHeaders({Authorization: 'Bearer $S{userAT}',}).withBody(dto).expectStatus(200);
      });
    });
    describe('Delete bookmark', () => {
      it('should delete bookmark by id', () => {
        return pactum.spec().delete('/bookmarks/$S{bmId}').withHeaders({Authorization: 'Bearer $S{userAT}',}).expectStatus(200).inspect();
      });
    });
    describe('Get empty bookmarks', () => {
      it('should get empty bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({Authorization: 'Bearer $S{userAT}',}).expectStatus(200);
      });
    });
  });
});