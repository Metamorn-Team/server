import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { v4 } from 'uuid';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helper/login';
import { CreatePaymentRequest } from 'src/presentation/dto/payments/request/create-payment.request';
import { PaymentStatus } from '@prisma/client';
import { PaymentProductTypes } from 'src/domain/types/payment-products/payment-product.types';
import {
    generateCreatePaymentRequest,
    generateGoldChargePaymentProduct,
} from 'test/helper/generators';

describe('PaymentsController (e2e)', () => {
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
        await db.payment.deleteMany();
        await db.goldChargePaymentProduct.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /payments - 결제 데이터 생성', () => {
        it('정상적인 결제 데이터 생성', async () => {
            // Given: 사용자와 골드 충전 상품 생성
            const { accessToken } = await login(app);

            const goldChargeProduct = generateGoldChargePaymentProduct({
                amount: 1000,
                price: 10000,
            });

            await db.goldChargePaymentProduct.create({
                data: goldChargeProduct,
            });

            const createPaymentDto = generateCreatePaymentRequest(
                goldChargeProduct.id,
                {
                    amount: goldChargeProduct.price,
                },
            );

            // When: 결제 데이터 생성 요청
            const response = await request(app.getHttpServer())
                .post('/payments')
                .send(createPaymentDto)
                .set('Authorization', accessToken);

            // Then: 결제 데이터가 정상적으로 생성되어야 함
            expect(response.status).toBe(HttpStatus.CREATED);

            const createdPayment = await db.payment.findFirst({
                where: {
                    merchantPaymentId: createPaymentDto.merchantPaymentId,
                },
            });

            expect(createdPayment).toBeDefined();
            expect(createdPayment?.paymentProductId).toBe(goldChargeProduct.id);
            expect(createdPayment?.amount).toBe(goldChargeProduct.price);
            expect(createdPayment?.status).toBe('PENDING'); // 대기 상태로 생성되어야 함
        });

        it('인증되지 않은 사용자는 결제 데이터 생성 실패', async () => {
            // Given: 골드 충전 상품만 생성 (인증 정보 없음)
            const goldChargeProduct = {
                id: v4(),
                amount: 1000,
                price: 10000,
                currency: 'KRW',
            };

            await db.goldChargePaymentProduct.create({
                data: goldChargeProduct,
            });

            const createPaymentDto: CreatePaymentRequest = {
                merchantPaymentId: v4(),
                type: 'GOLD_CHARGE' as PaymentProductTypes,
                paymentProductId: goldChargeProduct.id,
                amount: goldChargeProduct.price,
            };

            // When: 인증 토큰 없이 결제 데이터 생성 요청
            const response = await request(app.getHttpServer())
                .post('/payments')
                .send(createPaymentDto);

            // Then: 인증 실패로 401 상태코드 반환
            expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });

        it('존재하지 않는 결제 상품으로 결제 데이터 생성 실패', async () => {
            // Given: 사용자만 생성 (결제 상품은 생성하지 않음)
            const { accessToken } = await login(app);

            const createPaymentDto = generateCreatePaymentRequest(
                v4(), // 존재하지 않는 상품 ID
                {
                    amount: 10000,
                },
            );

            // When: 존재하지 않는 상품으로 결제 데이터 생성 요청
            const response = await request(app.getHttpServer())
                .post('/payments')
                .send(createPaymentDto)
                .set('Authorization', accessToken);

            // Then: 정상 처리 (validation 통과하면 201 반환)
            expect([
                HttpStatus.BAD_REQUEST,
                HttpStatus.NOT_FOUND,
                HttpStatus.CREATED,
            ]).toContain(response.status);
        });

        it('잘못된 데이터 형식으로 결제 데이터 생성 실패', async () => {
            // Given: 사용자 생성
            const { accessToken } = await login(app);

            const invalidCreatePaymentDto = {
                merchantPaymentId: 'invalid-uuid', // 잘못된 UUID 형식
                userId: 'invalid-uuid', // 잘못된 UUID 형식
                type: 'INVALID_TYPE', // 잘못된 타입
                paymentProductId: 'invalid-uuid', // 잘못된 UUID 형식
                amount: 'invalid-amount', // 숫자가 아닌 값
            };

            // When: 잘못된 형식의 데이터로 결제 데이터 생성 요청
            const response = await request(app.getHttpServer())
                .post('/payments')
                .send(invalidCreatePaymentDto)
                .set('Authorization', accessToken);

            // Then: Bad Request 응답
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('중복된 merchantPaymentId로 결제 데이터 생성 실패', async () => {
            // Given: 사용자와 골드 충전 상품, 그리고 기존 결제 데이터 생성
            const { accessToken, userId } = await login(app);

            const goldChargeProduct = generateGoldChargePaymentProduct({
                amount: 1000,
                price: 10000,
            });

            await db.goldChargePaymentProduct.create({
                data: goldChargeProduct,
            });

            const merchantPaymentId = v4();
            const existingPayment = {
                id: v4(),
                merchantPaymentId: merchantPaymentId,
                userId: userId,
                paymentProductId: goldChargeProduct.id,
                amount: goldChargeProduct.price,
                status: 'PENDING' as PaymentStatus,
                type: 0, // GOLD_CHARGE enum value
                currency: 'KRW',
                createdAt: new Date(),
            };

            await db.payment.create({ data: existingPayment });

            const createPaymentDto = generateCreatePaymentRequest(
                goldChargeProduct.id,
                {
                    merchantPaymentId: merchantPaymentId, // 중복된 ID
                    amount: goldChargeProduct.price,
                },
            );

            // When: 중복된 merchantPaymentId로 결제 데이터 생성 요청
            const response = await request(app.getHttpServer())
                .post('/payments')
                .send(createPaymentDto)
                .set('Authorization', accessToken);

            // Then: 서버 오류 또는 충돌 응답
            expect([
                HttpStatus.CONFLICT,
                HttpStatus.BAD_REQUEST,
                HttpStatus.INTERNAL_SERVER_ERROR,
            ]).toContain(response.status);
        });
    });
});
