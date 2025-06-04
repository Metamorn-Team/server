import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
    generateItem,
    generateProduct,
    generatePurchase,
} from 'test/helper/generators';
import { ItemGradeEnum, ItemTypeEnum } from 'src/domain/types/item.types';
import { login } from 'test/helper/login';
import { PurchaseRequest } from 'src/presentation/dto/purchases/request/puchase.request';

describe('PurchaseController (e2e)', () => {
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
        await db.goldTransaction.deleteMany();
        await db.purchase.deleteMany();
        await db.userOwnedItem.deleteMany();

        await db.product.deleteMany();
        await db.item.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /purchase - 상품 구매', () => {
        const auras = Array.from({ length: 10 }, (_, i) =>
            generateItem({
                name: `오라${i}`,
                description: `오라 설명${i}`,
                type: '',
                itemType: ItemTypeEnum.AURA,
                key: `aura${i}`,
                grade: ItemGradeEnum.NORMAL,
                createdAt: new Date(Date.now() + i),
            }),
        );
        const products = Array.from({ length: 10 }, (_, i) =>
            generateProduct(auras[i].id, {
                price: 100 + i * 10,
                createdAt: new Date(Date.now() + i),
            }),
        );

        beforeEach(async () => {
            await db.item.createMany({ data: auras });
            await db.product.createMany({ data: products });
        });

        it('구매 정상 동작', async () => {
            const { userId, accessToken } = await login(app);

            const totalPrice = products.reduce(
                (total, p) => total + p.price,
                0,
            );

            await db.user.update({
                data: { gold: totalPrice },
                where: { id: userId },
            });

            const dto: PurchaseRequest = {
                productIds: products.map((p) => p.id),
            };

            const response = await request(app.getHttpServer())
                .post('/purchases')
                .send(dto)
                .set('Authorization', accessToken);
            const { status } = response;

            const purchases = await db.purchase.findMany();
            const goldTranasction = await db.goldTransaction.findFirst();
            const user = await db.user.findUnique({ where: { id: userId } });

            expect(status).toEqual(HttpStatus.CREATED);
            expect(purchases.length).toEqual(products.length);
            expect(goldTranasction?.amount).toEqual(totalPrice);
            expect(user?.gold).toEqual(0);
            expect(goldTranasction?.balance).toEqual(user?.gold);
        });

        it('골드 잔액이 부족한 경우 예외가 발생한다', async () => {
            const { userId, accessToken } = await login(app);

            const totalPrice = products.reduce(
                (total, p) => total + p.price,
                0,
            );

            await db.user.update({
                data: { gold: totalPrice - 1 },
                where: { id: userId },
            });

            const dto: PurchaseRequest = {
                productIds: products.map((p) => p.id),
            };

            const response = await request(app.getHttpServer())
                .post('/purchases')
                .send(dto)
                .set('Authorization', accessToken);
            const { status } = response;

            expect(status).toEqual(422);
        });

        it('구매하려는 상품 중 존재하지 않는 상품이 존재하면 예외가 발생한다', async () => {
            const { accessToken } = await login(app);
            const noneExistProductId = '06a863a9-b087-45a1-97c1-e1c7af0b6dba';

            const dto: PurchaseRequest = {
                productIds: [...products.map((p) => p.id), noneExistProductId],
            };

            const response = await request(app.getHttpServer())
                .post('/purchases')
                .send(dto)
                .set('Authorization', accessToken);
            const { status } = response;

            expect(status).toEqual(404);
        });

        it('구매하려는 상품 중 구매 한도를 초과한 상품이 있는 경우 예외가 발생한다', async () => {
            const { accessToken, userId } = await login(app);

            const totalPrice = products.reduce(
                (total, p) => total + p.price,
                0,
            );

            await db.user.update({
                data: { gold: totalPrice },
                where: { id: userId },
            });

            const purchased = generatePurchase(userId, products[2].id);
            await db.purchase.create({ data: purchased });

            const dto: PurchaseRequest = {
                productIds: products.map((p) => p.id),
            };

            const response = await request(app.getHttpServer())
                .post('/purchases')
                .send(dto)
                .set('Authorization', accessToken);
            const { status } = response;

            expect(status).toEqual(409);
        });
    });
});
