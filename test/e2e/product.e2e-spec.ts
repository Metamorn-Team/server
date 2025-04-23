import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { v4 } from 'uuid';
import { login } from 'test/helper/login';
import { ResponseResult } from 'test/helper/types';
import { generateProduct } from 'test/helper/generators';
import { GetProductListRequest } from 'src/presentation/dto/product/request/get-product-list.request';
import { ProductCategory, ProductOrder } from 'src/presentation/dto/shared';
import { GetProductListResponse } from 'src/presentation/dto/product/response/get-product-list.response';

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
        await db.productCategory.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(() => {
        app.close();
    });

    describe('GET /products - 상품 목록 조회', () => {
        const stdDate = new Date();
        const categories = [
            {
                id: v4(),
                name: '오라',
                createdAt: stdDate,
                updatedAt: stdDate,
            },
            {
                id: v4(),
                name: '맵',
                createdAt: stdDate,
                updatedAt: stdDate,
            },
            {
                id: v4(),
                name: '말풍선',
                createdAt: stdDate,
                updatedAt: stdDate,
            },
        ];

        const auras = Array.from({ length: 20 }, (_, i) =>
            generateProduct(categories[0].id, {
                name: `오라${i}`,
                description: `오라 설명${i}`,
                price: 1000 + i,
                createdAt: new Date(Date.now() + i),
            }),
        );
        const maps = Array.from({ length: 20 }, (_, i) =>
            generateProduct(categories[1].id, {
                name: `맵${i}`,
                description: `맵 설명${i}`,
                price: 1000 + i,
                createdAt: new Date(Date.now() + i),
            }),
        );
        const bubbles = Array.from({ length: 20 }, (_, i) =>
            generateProduct(categories[2].id, {
                name: `말풍선${i}`,
                description: `말풍선 설명${i}`,
                price: 1000 + i,
                createdAt: new Date(Date.now() + i),
            }),
        );

        beforeEach(async () => {
            await db.productCategory.createMany({ data: categories });
            await db.product.createMany({
                data: [...auras, ...maps, ...bubbles],
            });
        });

        it('페이지네이션 정상 동작', async () => {
            const { accessToken } = await login(app);

            const query = {
                category: ProductCategory.AURA,
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
            expect(status2).toEqual(HttpStatus.OK);
            expect(body1.products.length).toEqual(7);
            expect(body2.products.length).toEqual(7);
            expect(body3.products.length).toEqual(6);
        });

        it('저렴한 순 조회 정상 동작', async () => {
            const { accessToken } = await login(app);

            const expectedProducts = auras
                .map((aura) => ({
                    id: aura.id,
                    name: aura.name,
                    description: aura.description,
                    price: aura.price,
                    coverImage: aura.coverImage,
                }))
                .sort((a, b) => (a.price > b.price ? 1 : -1));

            const query: GetProductListRequest = {
                category: ProductCategory.AURA,
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
            expect(body.products).toEqual(expectedProducts);
        });

        it('비싼 순 조회 정상 동작', async () => {
            const { accessToken } = await login(app);

            const expectedProducts = auras
                .map((aura) => ({
                    id: aura.id,
                    name: aura.name,
                    description: aura.description,
                    price: aura.price,
                    coverImage: aura.coverImage,
                }))
                .sort((a, b) => (a.price < b.price ? 1 : -1));

            const query: GetProductListRequest = {
                category: ProductCategory.AURA,
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

            const expectedProducts = auras
                .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                .map((aura) => ({
                    id: aura.id,
                    name: aura.name,
                    description: aura.description,
                    price: aura.price,
                    coverImage: aura.coverImage,
                }));

            const query: GetProductListRequest = {
                category: ProductCategory.AURA,
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
