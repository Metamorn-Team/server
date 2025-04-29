import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helper/login';
import { ResponseResult } from 'test/helper/types';
import { generateItem, generateProduct } from 'test/helper/generators';
import { GetProductListRequest } from 'src/presentation/dto/product/request/get-product-list.request';
import { ProductType, ProductOrder } from 'src/presentation/dto/shared';
import { GetProductListResponse } from 'src/presentation/dto/product/response/get-product-list.response';
import {
    convertNumberToGrade,
    ItemGradeEnum,
} from 'src/domain/types/item.types';

describe('ProductController (e2e)', () => {
    let app: INestApplication;
    let db: PrismaService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        db = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();
    });

    afterEach(async () => {
        await db.product.deleteMany();
        await db.item.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(() => {
        app.close();
    });

    describe('GET /products - 상품 목록 조회', () => {
        const auras = Array.from({ length: 20 }, (_, i) =>
            generateItem({
                name: `오라${i}`,
                description: `오라 설명${i}`,
                type: ProductType.AURA,
                key: `aura${i}`,
                grade: ItemGradeEnum.NORMAL,
                createdAt: new Date(Date.now() + i),
            }),
        );
        const products = Array.from({ length: 20 }, (_, i) =>
            generateProduct(auras[i].id, {
                price: 1000 + i,
                createdAt: new Date(Date.now() + i),
            }),
        );

        beforeEach(async () => {
            await db.item.createMany({ data: auras });
            await db.product.createMany({ data: products });
        });

        it('페이지네이션 정상 동작', async () => {
            const { accessToken } = await login(app);

            const query = {
                type: ProductType.AURA,
                order: ProductOrder.CHEAPEST,
                limit: 7,
            };
            const page1 = (await request(app.getHttpServer())
                .get('/products')
                .query({ ...query, page: 1 })
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetProductListResponse>;
            const page2 = (await request(app.getHttpServer())
                .get('/products')
                .query({ ...query, page: 2 })
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetProductListResponse>;
            const page3 = (await request(app.getHttpServer())
                .get('/products')
                .query({ ...query, page: 3 })
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetProductListResponse>;
            const { body: body1, status: status1 } = page1;
            const { body: body2, status: status2 } = page2;
            const { body: body3, status: status3 } = page3;

            expect(status1).toEqual(HttpStatus.OK);
            expect(status2).toEqual(HttpStatus.OK);
            expect(status3).toEqual(HttpStatus.OK);
            expect(body1.products.length).toEqual(7);
            expect(body1.count).not.toBeNull();
            expect(body2.products.length).toEqual(7);
            expect(body2.count).toBeNull();
            expect(body3.products.length).toEqual(6);
            expect(body3.count).toBeNull();
        });

        it('저렴한 순 조회 정상 동작', async () => {
            const { accessToken } = await login(app);

            const expectedProducts = products
                .map((product, i) => ({
                    id: product.id,
                    price: product.price,
                    coverImage: product.coverImage,
                    name: auras[i].name,
                    description: auras[i].description,
                    type: auras[i].type,
                    key: auras[i].key,
                    grade: convertNumberToGrade(auras[i].grade),
                    purchasedStatus: 'NONE',
                }))
                .sort((a, b) => (a.price > b.price ? 1 : -1));

            const query: GetProductListRequest = {
                type: ProductType.AURA,
                order: ProductOrder.CHEAPEST,
                limit: 20,
                page: 1,
            };
            const response = (await request(app.getHttpServer())
                .get('/products')
                .query(query)
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetProductListResponse>;
            const { body, status } = response;

            expect(status).toEqual(HttpStatus.OK);
            expect(body.count).toEqual(auras.length);
            expect(body.products).toEqual(expectedProducts);
        });

        it('비싼 순 조회 정상 동작', async () => {
            const { accessToken } = await login(app);

            const expectedProducts = products
                .map((product, i) => ({
                    id: product.id,
                    price: product.price,
                    coverImage: product.coverImage,
                    name: auras[i].name,
                    description: auras[i].description,
                    type: auras[i].type,
                    key: auras[i].key,
                    grade: convertNumberToGrade(auras[i].grade),
                    purchasedStatus: 'NONE',
                }))
                .sort((a, b) => (a.price < b.price ? 1 : -1));

            const query: GetProductListRequest = {
                type: ProductType.AURA,
                order: ProductOrder.PRICIEST,
                limit: 20,
                page: 1,
            };
            const response = (await request(app.getHttpServer())
                .get('/products')
                .query(query)
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetProductListResponse>;
            const { body, status } = response;

            expect(status).toEqual(HttpStatus.OK);
            expect(body.products).toEqual(expectedProducts);
        });

        it('최신 순 조회 정상 동작', async () => {
            const { accessToken } = await login(app);

            const expectedProducts = products
                .map((product, i) => ({
                    id: product.id,
                    price: product.price,
                    coverImage: product.coverImage,
                    name: auras[i].name,
                    description: auras[i].description,
                    type: auras[i].type,
                    key: auras[i].key,
                    grade: convertNumberToGrade(auras[i].grade),
                    createdAt: product.createdAt,
                    purchasedStatus: 'NONE',
                }))
                .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                .map((product) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { createdAt, ...rest } = product;
                    return rest;
                });

            const query: GetProductListRequest = {
                type: ProductType.AURA,
                order: ProductOrder.LATEST,
                limit: 20,
                page: 1,
            };
            const response = (await request(app.getHttpServer())
                .get('/products')
                .query(query)
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetProductListResponse>;
            const { body, status } = response;

            expect(status).toEqual(HttpStatus.OK);
            expect(body.products).toEqual(expectedProducts);
        });
    });
});
