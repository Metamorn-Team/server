import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { login } from 'test/helper/login';

describe('Items Input Validation (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /items/owned 입력 값 검증', () => {
        it('존재하지 않는 타입을 전달하면 예외가 발생한다.', async () => {
            const { accessToken } = await login(app);

            const query = {
                type: 'INVALID_TYPE',
                grade: 'NORMAL',
            };

            const response = await request(app.getHttpServer())
                .get('/items/owned')
                .query(query)
                .set('Authorization', accessToken);

            expect(response.status).toEqual(400);
        });

        it('존재하지 않는 등급을 전달하면 예외가 발생한다.', async () => {
            const { accessToken } = await login(app);

            const query = {
                type: 'AURA',
                grade: 'INVALID_GRADE',
            };

            const response = await request(app.getHttpServer())
                .get('/items/owned')
                .query(query)
                .set('Authorization', accessToken);

            expect(response.status).toEqual(400);
        });

        it('type이 누락되면 예외가 발생한다.', async () => {
            const { accessToken } = await login(app);

            const query = {
                grade: 'NORMAL',
            };

            const response = await request(app.getHttpServer())
                .get('/items/owned')
                .query(query)
                .set('Authorization', accessToken);

            expect(response.status).toEqual(400);
        });

        it('grade가 누락되면 예외가 발생한다.', async () => {
            const { accessToken } = await login(app);

            const query = {
                type: 'AURA',
            };

            const response = await request(app.getHttpServer())
                .get('/items/owned')
                .query(query)
                .set('Authorization', accessToken);

            expect(response.status).toEqual(400);
        });
    });
});
