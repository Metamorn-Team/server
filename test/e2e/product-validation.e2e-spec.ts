import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ProductType, ProductOrder } from 'src/presentation/dto/shared';
import { login } from 'test/helper/login';

describe('Products Input Validation (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(() => {
        app.close();
    });

    describe('GET /products 입력 값 검증', () => {
        it('존재하지 않는 카테고리 값을 전달하면 예외가 발생한다.', async () => {
            const { accessToken } = await login(app);

            const query = {
                category: '달팽이',
                order: ProductOrder.LATEST,
                limit: 20,
                page: 1,
            };
            const response = await request(app.getHttpServer())
                .get('/products')
                .query(query)
                .set('Authorization', accessToken);

            expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        });

        it('존재하지 않는 정렬 기준을 전달하면 예외가 발생한다.', async () => {
            const { accessToken } = await login(app);

            const query = {
                category: ProductType.AURA,
                order: 'old',
                limit: 20,
                page: 1,
            };
            const response = await request(app.getHttpServer())
                .get('/products')
                .query(query)
                .set('Authorization', accessToken);

            expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        });

        it('page가 1보다 작으면 예외가 발생한다.', async () => {
            const { accessToken } = await login(app);

            const query = {
                category: ProductType.AURA,
                order: ProductOrder.LATEST,
                limit: 20,
                page: 0,
            };
            const response = await request(app.getHttpServer())
                .get('/products')
                .query(query)
                .set('Authorization', accessToken);

            expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        });

        it('limit이 1보다 작으면 예외가 발생한다.', async () => {
            const { accessToken } = await login(app);

            const query = {
                category: ProductType.AURA,
                order: ProductOrder.LATEST,
                limit: 0,
                page: 1,
            };
            const response = await request(app.getHttpServer())
                .get('/products')
                .query(query)
                .set('Authorization', accessToken);

            expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        });

        it('limit이 30보다 크면 예외가 발생한다.', async () => {
            const { accessToken } = await login(app);

            const query = {
                category: ProductType.AURA,
                order: ProductOrder.LATEST,
                limit: 31,
                page: 1,
            };
            const response = await request(app.getHttpServer())
                .get('/products')
                .query(query)
                .set('Authorization', accessToken);

            expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        });
    });
});
