import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { v4 } from 'uuid';
import { GoldChargeCompletionHandler } from 'src/domain/components/payments/gold-charge-completion-handler';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { Payment } from 'src/domain/types/payments/payment.types';
import { PaymentProductTypesEnum } from 'src/domain/types/payment-products/payment-product.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import { PaymentCompletionHandlerFactoryModule } from 'src/modules/payments/payment-completion-handler-factory.module';
import {
    generateGoldChargePaymentProduct,
    generatePayment,
    generateUserEntityV2,
} from 'test/helper/generators';
import { COMMON_IMPORTS } from 'test/unit/services/commom-imports';

describe('GoldChargeCompletionHandler', () => {
    let app: TestingModule;
    let handler: GoldChargeCompletionHandler;
    let db: PrismaService;
    let redis: Redis;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [PaymentCompletionHandlerFactoryModule, ...COMMON_IMPORTS],
        }).compile();

        handler = app.get<GoldChargeCompletionHandler>(
            GoldChargeCompletionHandler,
        );
        db = app.get<PrismaService>(PrismaService);
        redis = app.get<RedisClientService>(RedisClientService).getClient();
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await redis.flushall();
        await db.payment.deleteMany();
        await db.goldChargePaymentProduct.deleteMany();
        await db.user.deleteMany();
    });

    describe('handle', () => {
        it('골드 충전이 정상 동작한다', async () => {
            // Given: 사용자, 상품, 결제 데이터 생성
            const user = generateUserEntityV2({ gold: 500 });
            const product = generateGoldChargePaymentProduct({
                amount: 1000,
                price: 10000,
            });
            const merchantPaymentId = v4();
            const paymentRecord = generatePayment(user.id, product.id, {
                merchantPaymentId,
                amount: product.price,
                status: 'PENDING',
            });

            await db.user.create({ data: user });
            await db.goldChargePaymentProduct.create({ data: product });
            await db.payment.create({ data: paymentRecord });

            const paymentData: Payment = {
                paymentId: merchantPaymentId,
                productId: product.id,
                userId: user.id,
                totalPrice: product.price,
                productType: PaymentProductTypesEnum.GOLD_CHARGE,
                paymentMethod: 'card',
                paymentMethodDetail: 'visa',
            };

            // When: 결제 완료 처리
            await handler.handle(paymentData);

            // Then: 골드가 충전되고 결제 상태가 업데이트되어야 함
            const updatedUser = await db.user.findUnique({
                where: { id: user.id },
            });
            const updatedPayment = await db.payment.findUnique({
                where: { id: paymentRecord.id },
            });

            expect(updatedUser?.gold).toBe(1500); // 500 + 1000
            expect(updatedPayment?.status).toBe('COMPLETE');
            expect(updatedPayment?.method).toBe('card');
            expect(updatedPayment?.methodDetail).toBe('visa');
        });

        it('결제 금액이 상품 가격과 일치하지 않으면 예외가 발생한다', async () => {
            // Given: 사용자, 상품, 결제 데이터 생성 (금액 불일치)
            const user = generateUserEntityV2({ gold: 500 });
            const product = generateGoldChargePaymentProduct({
                amount: 1000,
                price: 10000,
            });
            const merchantPaymentId = v4();
            const paymentRecord = generatePayment(user.id, product.id, {
                merchantPaymentId,
                amount: product.price,
                status: 'PENDING',
            });

            await db.user.create({ data: user });
            await db.goldChargePaymentProduct.create({ data: product });
            await db.payment.create({ data: paymentRecord });

            const paymentData: Payment = {
                paymentId: merchantPaymentId,
                productId: product.id,
                userId: user.id,
                totalPrice: 15000, // 상품 가격과 다름
                productType: PaymentProductTypesEnum.GOLD_CHARGE,
                paymentMethod: 'card',
            };

            // When & Then: 예외가 발생해야 함
            await expect(handler.handle(paymentData)).rejects.toThrow(
                DomainException,
            );

            // 골드 잔액과 결제 상태는 변경되지 않아야 함
            const unchangedUser = await db.user.findUnique({
                where: { id: user.id },
            });
            const unchangedPayment = await db.payment.findUnique({
                where: { id: paymentRecord.id },
            });

            expect(unchangedUser?.gold).toBe(500); // 변경되지 않음
            expect(unchangedPayment?.status).toBe('PENDING'); // 변경되지 않음
        });

        it('상품 ID가 일치하지 않으면 예외가 발생한다', async () => {
            // Given: 사용자, 상품, 결제 데이터 생성 (상품 ID 불일치)
            const user = generateUserEntityV2({ gold: 500 });
            const product = generateGoldChargePaymentProduct({
                amount: 1000,
                price: 10000,
            });
            const differentProduct = generateGoldChargePaymentProduct({
                amount: 2000,
                price: 20000,
            });
            const merchantPaymentId = v4();
            const paymentRecord = generatePayment(
                user.id,
                differentProduct.id,
                {
                    merchantPaymentId,
                    amount: product.price,
                    status: 'PENDING',
                },
            );

            await db.user.create({ data: user });
            await db.goldChargePaymentProduct.createMany({
                data: [product, differentProduct],
            });
            await db.payment.create({ data: paymentRecord });

            const paymentData: Payment = {
                paymentId: merchantPaymentId,
                productId: product.id, // paymentRecord와 다른 상품 ID
                userId: user.id,
                totalPrice: product.price,
                productType: PaymentProductTypesEnum.GOLD_CHARGE,
                paymentMethod: 'card',
            };

            // When & Then: 예외가 발생해야 함
            await expect(handler.handle(paymentData)).rejects.toThrow(
                DomainException,
            );

            // 골드 잔액과 결제 상태는 변경되지 않아야 함
            const unchangedUser = await db.user.findUnique({
                where: { id: user.id },
            });
            const unchangedPayment = await db.payment.findUnique({
                where: { id: paymentRecord.id },
            });

            expect(unchangedUser?.gold).toBe(500);
            expect(unchangedPayment?.status).toBe('PENDING');
        });

        it('존재하지 않는 상품으로 결제하면 예외가 발생한다', async () => {
            // Given: 사용자와 결제 데이터만 생성 (상품 없음)
            const user = generateUserEntityV2({ gold: 500 });
            const fakeProductId = v4();
            const merchantPaymentId = v4();
            const paymentRecord = generatePayment(user.id, fakeProductId, {
                merchantPaymentId,
                amount: 10000,
                status: 'PENDING',
            });

            await db.user.create({ data: user });
            await db.payment.create({ data: paymentRecord });

            const paymentData: Payment = {
                paymentId: merchantPaymentId,
                productId: fakeProductId,
                userId: user.id,
                totalPrice: 10000,
                productType: PaymentProductTypesEnum.GOLD_CHARGE,
                paymentMethod: 'card',
            };

            // When & Then: 예외가 발생해야 함
            await expect(handler.handle(paymentData)).rejects.toThrow();
        });

        it('존재하지 않는 결제 정보로 처리하면 예외가 발생한다', async () => {
            // Given: 사용자와 상품만 생성 (결제 정보 없음)
            const user = generateUserEntityV2({ gold: 500 });
            const product = generateGoldChargePaymentProduct({
                amount: 1000,
                price: 10000,
            });

            await db.user.create({ data: user });
            await db.goldChargePaymentProduct.create({ data: product });

            const paymentData: Payment = {
                paymentId: v4(),
                productId: product.id,
                userId: user.id,
                totalPrice: product.price,
                productType: PaymentProductTypesEnum.GOLD_CHARGE,
                paymentMethod: 'card',
            };

            // When & Then: 예외가 발생해야 함
            await expect(handler.handle(paymentData)).rejects.toThrow();
        });

        it('결제 방법 상세 정보가 없어도 정상 처리된다', async () => {
            // Given: 결제 방법 상세 정보가 없는 데이터
            const user = generateUserEntityV2({ gold: 0 });
            const product = generateGoldChargePaymentProduct({
                amount: 500,
                price: 5000,
            });
            const merchantPaymentId = v4();
            const paymentRecord = generatePayment(user.id, product.id, {
                merchantPaymentId,
                amount: product.price,
                status: 'PENDING',
            });

            await db.user.create({ data: user });
            await db.goldChargePaymentProduct.create({ data: product });
            await db.payment.create({ data: paymentRecord });

            const paymentData: Payment = {
                paymentId: merchantPaymentId,
                productId: product.id,
                userId: user.id,
                totalPrice: product.price,
                productType: PaymentProductTypesEnum.GOLD_CHARGE,
                paymentMethod: 'bank_transfer',
                // paymentMethodDetail 없음
            };

            // When: 결제 완료 처리
            await handler.handle(paymentData);

            // Then: 정상 처리되어야 함
            const updatedUser = await db.user.findUnique({
                where: { id: user.id },
            });
            const updatedPayment = await db.payment.findUnique({
                where: { id: paymentRecord.id },
            });

            expect(updatedUser?.gold).toBe(500);
            expect(updatedPayment?.status).toBe('COMPLETE');
            expect(updatedPayment?.method).toBe('bank_transfer');
            expect(updatedPayment?.methodDetail).toBeNull();
        });
    });

    describe('transaction', () => {
        it('골드 잔액 증가와 결제 상태 업데이트가 트랜잭션으로 처리된다', async () => {
            // Given: 사용자와 결제 데이터
            const user = generateUserEntityV2({ gold: 100 });
            const productId = v4();
            const merchantPaymentId = v4();
            const paymentRecord = generatePayment(user.id, productId, {
                merchantPaymentId,
                status: 'PENDING',
            });

            await db.user.create({ data: user });
            await db.payment.create({ data: paymentRecord });

            // When: 트랜잭션 실행
            await handler.transaction(
                paymentRecord.id,
                user.id,
                900,
                'credit_card',
                'visa-1234',
            );

            // Then: 골드와 결제 상태가 모두 업데이트되어야 함
            const updatedUser = await db.user.findUnique({
                where: { id: user.id },
            });
            const updatedPayment = await db.payment.findUnique({
                where: { id: paymentRecord.id },
            });

            expect(updatedUser?.gold).toBe(1000); // 100 + 900
            expect(updatedPayment?.status).toBe('COMPLETE');
            expect(updatedPayment?.method).toBe('credit_card');
            expect(updatedPayment?.methodDetail).toBe('visa-1234');
        });

        it('선택적 매개변수 없이도 정상 처리된다', async () => {
            // Given: 사용자와 결제 데이터
            const user = generateUserEntityV2({ gold: 0 });
            const productId = v4();
            const merchantPaymentId = v4();
            const paymentRecord = generatePayment(user.id, productId, {
                merchantPaymentId,
                status: 'PENDING',
            });

            await db.user.create({ data: user });
            await db.payment.create({ data: paymentRecord });

            // When: 선택적 매개변수 없이 트랜잭션 실행
            await handler.transaction(paymentRecord.id, user.id, 250);

            // Then: 정상 처리되어야 함
            const updatedUser = await db.user.findUnique({
                where: { id: user.id },
            });
            const updatedPayment = await db.payment.findUnique({
                where: { id: paymentRecord.id },
            });

            expect(updatedUser?.gold).toBe(250);
            expect(updatedPayment?.status).toBe('COMPLETE');
            expect(updatedPayment?.method).toBeNull();
            expect(updatedPayment?.methodDetail).toBeNull();
        });
    });
});
