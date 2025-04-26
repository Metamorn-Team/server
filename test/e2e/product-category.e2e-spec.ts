import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { v4 } from 'uuid';
import { login } from 'test/helper/login';
import { ResponseResult } from 'test/helper/types';
import { ProductCategoryItem } from 'src/presentation/dto/product-categories';

describe('ProductCategotyController (e2e)', () => {
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
        await db.productCategory.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(() => {
        app.close();
    });

    describe('GET /product-categories - 상품 카테고리 전체 조회', () => {
        it('전체 조회 정상 동작', async () => {
            const { accessToken } = await login(app);

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
                {
                    id: v4(),
                    name: '오브젝트',
                    createdAt: stdDate,
                    updatedAt: stdDate,
                },
            ];
            const expectedCategories = categories.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            await db.productCategory.createMany({ data: categories });

            const response = (await request(app.getHttpServer())
                .get('/product-categories')
                .set('Authorization', accessToken)) as ResponseResult<
                ProductCategoryItem[]
            >;
            const { body, status } = response;

            expect(status).toEqual(HttpStatus.OK);
            expect(body.length).toEqual(categories.length);
        });
    });
});
