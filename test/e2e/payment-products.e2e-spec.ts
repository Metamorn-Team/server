import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helper/login';
import { ResponseResult } from 'test/helper/types';
import { GoldChargePaymentProductListResponse } from 'src/presentation/dto/payment-products/response/gold-charge-payment-product-list.response';
import { v4 } from 'uuid';

describe('PaymentProductsController (e2e)', () => {
    let app: INestApplication;
    let db: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        db = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();
    });

    afterEach(async () => {
        await db.refreshToken.deleteMany();
        await db.goldChargePaymentProduct.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /payment-products/gold-charge - 골드 충전 상품 전체 조회', () => {
        const goldChargeProducts = [
            {
                id: v4(),
                amount: 100,
                price: 1100,
                currency: 'KRW',
            },
            {
                id: v4(),
                amount: 500,
                price: 5500,
                currency: 'KRW',
            },
            {
                id: v4(),
                amount: 1000,
                price: 11000,
                currency: 'KRW',
            },
            {
                id: v4(),
                amount: 2000,
                price: 22000,
                currency: 'KRW',
            },
            {
                id: v4(),
                amount: 5000,
                price: 55000,
                currency: 'KRW',
            },
        ];

        beforeEach(async () => {
            await db.goldChargePaymentProduct.createMany({
                data: goldChargeProducts,
            });
        });

        it('인증된 사용자가 골드 충전 상품 목록을 정상적으로 조회할 수 있다', async () => {
            const { accessToken } = await login(app);

            const response = (await request(app.getHttpServer())
                .get('/payment-products/gold-charge')
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GoldChargePaymentProductListResponse>;

            const { body, status } = response;
            expect(status).toEqual(HttpStatus.OK);
            expect(body.products).toHaveLength(5);

            // 생성한 상품들이 모두 응답에 포함되어 있는지 확인
            goldChargeProducts.forEach((product) => {
                expect(body.products).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: product.id,
                            amount: product.amount,
                            price: product.price,
                        }),
                    ]),
                );
            });
        });

        it('인증되지 않은 사용자는 접근할 수 없다', async () => {
            const response = await request(app.getHttpServer()).get(
                '/payment-products/gold-charge',
            );

            expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        });

        it('상품들이 올바른 형식으로 반환된다', async () => {
            const { accessToken } = await login(app);

            const response = (await request(app.getHttpServer())
                .get('/payment-products/gold-charge')
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GoldChargePaymentProductListResponse>;

            const { body, status } = response;
            expect(status).toEqual(HttpStatus.OK);
            body.products.forEach((product) => {
                expect(product).toHaveProperty('id');
                expect(product).toHaveProperty('amount');
                expect(product).toHaveProperty('price');
                expect(typeof product.id).toBe('string');
                expect(typeof product.amount).toBe('number');
                expect(typeof product.price).toBe('number');
                expect(product.amount).toBeGreaterThan(0);
                expect(product.price).toBeGreaterThan(0);
            });
        });
    });
});
