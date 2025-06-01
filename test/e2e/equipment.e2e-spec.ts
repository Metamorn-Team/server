import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helper/login';
import { generateItem } from 'test/helper/generators';
import { SlotType } from 'src/domain/types/equipment';
import { ItemGradeEnum, ItemTypeEnum } from 'src/domain/types/item.types';
import { ResponseResult } from 'test/helper/types';
import { EquippedItemsResponse } from 'types';

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
                type: 'AURA',
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
                )) as ResponseResult<EquippedItemsResponse>;
            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.equippedItems).toHaveLength(1);
            expect(body.equippedItems[0]).toMatchObject({
                slot: 'AURA',
                key: item.key,
            });
        });

        it('같은 부위에 다른 아이템을 장착하면 기존 장착이 덮어써져야 한다', async () => {
            const { accessToken } = await login(app);

            const item1 = generateItem({
                name: '첫 번째 오라',
                description: '기존 오라',
                type: 'AURA',
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
                type: 'AURA',
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
                )) as ResponseResult<EquippedItemsResponse>;

            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.equippedItems).toHaveLength(1);
            expect(body.equippedItems[0]).toMatchObject({
                slot: 'AURA',
                key: item2.key,
            });
        });
    });
});
