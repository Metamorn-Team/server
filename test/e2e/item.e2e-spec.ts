import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helper/login';
import { generateItem, generateOwnedItem } from 'test/helper/generators';
import { ResponseResult } from 'test/helper/types';
import {
    convertNumberToItemGrade,
    convertNumberToItemType,
    ItemGradeEnum,
    ItemTypeEnum,
} from 'src/domain/types/item.types';
import { GetOwnedItemListResponse } from 'src/presentation/dto';

describe('ItemController (e2e)', () => {
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
        await db.userOwnedItem.deleteMany();
        await db.item.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /items/owned - 소유 아이템 조회', () => {
        it('소유 아이템을 정상 조회한다', async () => {
            const { accessToken, userId } = await login(app);

            const items = Array.from({ length: 5 }, (_, i) =>
                generateItem({
                    name: `오라${i}`,
                    description: `설명${i}`,
                    type: 'AURA',
                    itemType: ItemTypeEnum.AURA,
                    key: `aura_key_${i}`,
                    grade: ItemGradeEnum.NORMAL,
                }),
            );
            const userOwneds = items.map((item) =>
                generateOwnedItem(userId, item.id),
            );

            await db.item.createMany({ data: items });
            await db.userOwnedItem.createMany({ data: userOwneds });

            const query = {
                type: 'AURA',
                grade: 'NORMAL',
            };

            const response = (await request(app.getHttpServer())
                .get('/items/owned')
                .query(query)
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetOwnedItemListResponse>;

            const { status, body } = response;

            expect(status).toBe(200);
            expect(body.items.length).toBe(5);
            body.items.forEach((item, i) => {
                const expected = items[i];

                expect(item).toMatchObject({
                    id: expected.id,
                    name: expected.name,
                    description: expected.description,
                    type: convertNumberToItemType(expected.itemType),
                    key: expected.key,
                    grade: convertNumberToItemGrade(expected.grade),
                });
                expect(item.image).toMatch(/^https?:\/\//);
            });
        });
    });
});
