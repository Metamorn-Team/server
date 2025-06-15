/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { generatePromotion } from 'test/helper/generators';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helper/login';
import { ResponseResult } from 'test/helper/types';
import { GetAllPromotionResponse } from 'src/presentation/dto/promotions/response/get-all-promotion.response';
import { PromotionTypeEnum } from 'src/domain/types/promotion.types';

describe('PromotionController (e2e)', () => {
    let app: INestApplication;
    let db: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        db = app.get(PrismaService);
    });

    afterEach(async () => {
        await db.promotion.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /promotions/all - 진행 중인 모든 프로모션 조회', () => {
        const promotions = Array.from({ length: 5 }, (_, i) =>
            generatePromotion({
                description: `프로모션 ${i}입니다`,
                name: `프로모션 ${i}`,
                type: PromotionTypeEnum.LAUNCH,
            }),
        );

        beforeEach(async () => {
            await db.promotion.createMany({ data: promotions });
        });

        it('진행 중인 모든 프로모션 조회 정상 동작', async () => {
            const { accessToken } = await login(app);

            const response = (await request(app.getHttpServer())
                .get('/promotions/all')
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetAllPromotionResponse>;
            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.promotions.length).toEqual(promotions.length);
        });

        it('시작되지 않았거나 종료된 프로모션은 조회되지 않는다', async () => {
            const beforeStartPromotion = generatePromotion({
                name: '시작전..',
                description: '시작전..',
                startedAt: new Date(Date.now() + 1000),
            });
            const endedPromotion = generatePromotion({
                name: '종료된',
                description: '종료된..',
                endedAt: new Date(Date.now() - 10),
            });
            await db.promotion.createMany({
                data: [beforeStartPromotion, endedPromotion],
            });

            const { accessToken } = await login(app);

            const response = (await request(app.getHttpServer())
                .get('/promotions/all')
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetAllPromotionResponse>;
            const { status, body } = response;
            const { promotions } = body;

            const foundEndedPromotion = promotions.find(
                (p) => p.id === endedPromotion.id,
            );
            const foundBeforeStartPromotion = promotions.find(
                (p) => p.id === beforeStartPromotion.id,
            );

            expect(status).toEqual(200);
            expect(promotions.length).toEqual(promotions.length);
            expect(foundBeforeStartPromotion).toBeUndefined();
            expect(foundEndedPromotion).toBeUndefined();
        });
    });
});
