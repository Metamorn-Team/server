import { Test, TestingModule } from '@nestjs/testing';
import { IslandJoinService } from 'src/domain/services/island-join/island-join.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { IslandJoinModule } from 'src/modules/island-joins/island-join.module';
import { generateIsland, generateUserEntity } from 'test/helper/generators';
import { COMMON_IMPORTS } from 'test/unit/services/commom-imports';

describe('IslandJoinService', () => {
    let app: TestingModule;
    let islandJoinService: IslandJoinService;
    let db: PrismaService;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [IslandJoinModule, ...COMMON_IMPORTS],
        }).compile();

        islandJoinService = app.get<IslandJoinService>(IslandJoinService);
        db = app.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await db.islandJoin.deleteMany();
        await db.island.deleteMany();
        await db.island.deleteMany();
    });

    describe('섬 참여 데이터 생성', () => {
        const user = generateUserEntity('test@test.com', 'nickname', 'tag');
        const island = generateIsland();

        beforeEach(async () => {
            await db.user.create({ data: user });
            await db.island.create({ data: island });
        });

        it('섬 참여 데이터 생성 정상 동작', async () => {
            await islandJoinService.create(island.id, user.id);

            const islandJoin = (await db.islandJoin.findMany())[0];

            expect(islandJoin.id).toBeTruthy();
            expect(islandJoin.islandId).toEqual(island.id);
            expect(islandJoin.userId).toEqual(user.id);
            expect(islandJoin.joinedAt).toBeTruthy();
            expect(islandJoin.leftAt).toBeNull();
        });
    });
});
