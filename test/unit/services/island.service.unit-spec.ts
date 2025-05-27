import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-config';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { IslandService } from 'src/domain/services/islands/island.service';
import { NormalIslandUpdateInput } from 'src/domain/types/island.types';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import { IslandServiceModule } from 'src/modules/islands/island-service.module';
import {
    generateIsland,
    generateNormalIslandModel,
    generateUserEntity,
} from 'test/helper/generators';

describe('IslandService', () => {
    let app: TestingModule;
    let islandService: IslandService;
    let db: PrismaService;
    let redis: Redis;
    let normalIslandStorage: NormalIslandStorage;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [
                IslandServiceModule,
                PrismaModule,
                ClsModule.forRoot(clsOptions),
            ],
        }).compile();

        islandService = app.get<IslandService>(IslandService);
        db = app.get<PrismaService>(PrismaService);
        redis = app.get<RedisClientService>(RedisClientService).getClient();
        normalIslandStorage = app.get<NormalIslandStorage>(NormalIslandStorage);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await redis.flushall();
        await db.island.deleteMany();
        await db.user.deleteMany();
    });

    describe('일반 섬 정보 업데이트', () => {
        const user = generateUserEntity('test@test.com', 'nickname', 'tag');
        const island = generateIsland({ ownerId: user.id });
        const LiveIsland = generateNormalIslandModel({
            id: island.id,
            ownerId: user.id,
            name: island.name,
            coverImage: island.coverImage,
            description: island.description,
            max: island.maxMembers,
        });

        beforeEach(async () => {
            await db.user.create({ data: user });
            await db.island.create({ data: island });
            await normalIslandStorage.createIsland(LiveIsland);
        });

        it('섬 정보 업데이트 정상 동작', async () => {
            const input: NormalIslandUpdateInput = {
                name: '업데이트된 섬 이름',
                description: '업데이트된 섬 설명',
                coverImage: 'https://example.com/updated-cover.jpg',
            };

            await islandService.update(island.id, user.id, input);
            const updatedIsland = await db.island.findUnique({
                where: { id: island.id },
            });
            const updatedLiveIsland = await normalIslandStorage.getIsland(
                island.id,
            );

            expect(updatedIsland?.name).toBe(input.name);
            expect(updatedIsland?.description).toBe(input.description);
            expect(updatedIsland?.coverImage).toBe(input.coverImage);

            expect(updatedLiveIsland?.name).toBe(input.name);
            expect(updatedLiveIsland?.description).toBe(input.description);
            expect(updatedLiveIsland?.coverImage).toBe(input.coverImage);
        });

        it('섬 주인이 아닌 회원이 업데이트 하려는 경우 예외가 발생한다', async () => {
            const nonOwnerId = '4ae4e826-7257-44fd-bf4e-e8e3ba011390';

            const input: NormalIslandUpdateInput = {
                name: '업데이트된 섬 이름',
                description: '업데이트된 섬 설명',
                coverImage: 'https://example.com/updated-cover.jpg',
            };

            await expect(() =>
                islandService.update(island.id, nonOwnerId, input),
            ).rejects.toThrow();
        });
    });
});
