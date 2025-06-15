/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helper/login';
import { generateItem } from 'test/helper/generators';
import { SlotType } from 'src/domain/types/equipment.types';
import { ItemGradeEnum, ItemTypeEnum } from 'src/domain/types/item.types';
import { ResponseResult } from 'test/helper/types';
import { EquipmentStateResponse } from 'types';

describe('EquipmentController (e2e)', () => {
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
        await db.equipment.deleteMany();
        await db.item.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /equipments - 아이템 장착', () => {
        it('아이템을 장착하고 조회 결과에 나타나야 한다', async () => {
            const { accessToken } = await login(app);

            const item = generateItem({
                name: '장착용 오라',
                description: '테스트용 오라입니다',
                key: 'test-aura-key',
                itemType: ItemTypeEnum.AURA,
                grade: ItemGradeEnum.NORMAL,
            });
            await db.item.create({ data: item });

            const slot: SlotType = 'AURA';
            await request(app.getHttpServer())
                .post('/equipments')
                .set('Authorization', accessToken)
                .send({ itemId: item.id, slot })
                .expect(201);

            const response = (await request(app.getHttpServer())
                .get('/equipments/equipped')
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<EquipmentStateResponse>;
            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.equipmentState.AURA).toMatchObject({
                key: item.key,
                name: item.name,
            });
            expect(body.equipmentState.SPEECH_BUBBLE).toBeNull();
        });

        it('같은 부위에 다른 아이템을 장착하면 기존 장착이 덮어써져야 한다', async () => {
            const { accessToken } = await login(app);

            const item1 = generateItem({
                name: '첫 번째 오라',
                description: '기존 오라',
                key: 'first-aura-key',
                itemType: ItemTypeEnum.AURA,
                grade: ItemGradeEnum.NORMAL,
            });
            await db.item.create({ data: item1 });

            const slot: SlotType = 'AURA';
            await request(app.getHttpServer())
                .post('/equipments')
                .set('Authorization', accessToken)
                .send({ itemId: item1.id, slot })
                .expect(201);

            const item2 = generateItem({
                name: '두 번째 오라',
                description: '덮어쓸 오라',
                key: 'second-aura-key',
                itemType: ItemTypeEnum.AURA,
                grade: ItemGradeEnum.NORMAL,
            });
            await db.item.create({ data: item2 });

            await request(app.getHttpServer())
                .post('/equipments')
                .set('Authorization', accessToken)
                .send({ itemId: item2.id, slot })
                .expect(201);

            const response = (await request(app.getHttpServer())
                .get('/equipments/equipped')
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<EquipmentStateResponse>;

            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.equipmentState.AURA).toMatchObject({
                key: item2.key,
                name: item2.name,
            });
            expect(body.equipmentState.SPEECH_BUBBLE).toBeNull();
        });

        describe('입력 값 검증', () => {
            it('itemId가 UUID 형식이 아니면 예외가 발생한다.', async () => {
                const { accessToken } = await login(app);

                const body = {
                    itemId: 'not-a-uuid',
                    slot: 'AURA',
                };

                const response = await request(app.getHttpServer())
                    .post('/equipments')
                    .set('Authorization', accessToken)
                    .send(body);

                expect(response.status).toEqual(400);
            });

            it('존재하지 않는 슬롯을 전달하면 예외가 발생한다.', async () => {
                const { accessToken } = await login(app);

                const body = {
                    itemId: '123e4567-e89b-12d3-a456-426614174000',
                    slot: 'INVALID_SLOT',
                };

                const response = await request(app.getHttpServer())
                    .post('/equipments')
                    .set('Authorization', accessToken)
                    .send(body);

                expect(response.status).toEqual(400);
            });

            it('itemId가 누락되면 예외가 발생한다.', async () => {
                const { accessToken } = await login(app);

                const body = {
                    slot: 'AURA',
                };

                const response = await request(app.getHttpServer())
                    .post('/equipments')
                    .set('Authorization', accessToken)
                    .send(body);

                expect(response.status).toEqual(400);
            });

            it('slot이 누락되면 예외가 발생한다.', async () => {
                const { accessToken } = await login(app);

                const body = {
                    itemId: '123e4567-e89b-12d3-a456-426614174000',
                };

                const response = await request(app.getHttpServer())
                    .post('/equipments')
                    .set('Authorization', accessToken)
                    .send(body);

                expect(response.status).toEqual(400);
            });
        });
    });
});
