import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { TOO_MANY_PARTICIPANTS_MESSAGE } from 'src/domain/exceptions/message';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { IslandService } from 'src/domain/services/islands/island.service';
import { NormalIslandUpdateInput } from 'src/domain/types/island.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import { IslandServiceModule } from 'src/modules/islands/island-service.module';
import {
    generateIsland,
    generateNormalIslandModel,
    generateUserEntity,
} from 'test/helper/generators';
import { COMMON_IMPORTS } from 'test/unit/services/commom-imports';

describe('IslandService', () => {
    let app: TestingModule;
    let islandService: IslandService;
    let db: PrismaService;
    let redis: Redis;
    let normalIslandStorage: NormalIslandStorage;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [IslandServiceModule, ...COMMON_IMPORTS],
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
        const island = generateIsland({
            ownerId: user.id,
            maxMembers: 2,
            description: '섬 설명',
            coverImage: 'https://example.com/cover.jpg',
            name: '섬 이름',
        });
        const liveIsland = generateNormalIslandModel({
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
            await normalIslandStorage.createIsland(liveIsland);
        });

        it('섬 정보 업데이트 정상 동작', async () => {
            const input: NormalIslandUpdateInput = {
                name: '업데이트된 섬 이름',
                description: '업데이트된 섬 설명',
                coverImage: 'https://example.com/updated-cover.jpg',
                maxMembers: 3,
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
            expect(updatedIsland?.maxMembers).toBe(input.maxMembers);

            expect(updatedLiveIsland?.name).toBe(input.name);
            expect(updatedLiveIsland?.description).toBe(input.description);
            expect(updatedLiveIsland?.coverImage).toBe(input.coverImage);
            expect(updatedLiveIsland?.max).toBe(input.maxMembers);
        });

        it('입력하지 않은 값은 모두 기존 값을 유지한다', async () => {
            const input: NormalIslandUpdateInput = {
                name: '업데이트된 섬 이름',
            };

            await islandService.update(island.id, user.id, input);
            const updatedIsland = await db.island.findUnique({
                where: { id: island.id },
            });
            const updatedLiveIsland = await normalIslandStorage.getIsland(
                island.id,
            );

            expect(updatedIsland?.name).toBe(input.name);
            expect(updatedIsland?.description).toBe(island.description);
            expect(updatedIsland?.coverImage).toBe(island.coverImage);
            expect(updatedIsland?.maxMembers).toBe(island.maxMembers);

            expect(updatedLiveIsland?.name).toBe(input.name);
            expect(updatedLiveIsland?.description).toBe(liveIsland.description);
            expect(updatedLiveIsland?.coverImage).toBe(liveIsland.coverImage);
            expect(updatedLiveIsland?.max).toBe(liveIsland.max);
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

        it('변경하려는 최대 인원보다 현재 인원이 더 많은 경우 예외가 발생한다', async () => {
            await normalIslandStorage.addPlayerToIsland(island.id, 'player1');
            await normalIslandStorage.addPlayerToIsland(island.id, 'player2');

            const input: NormalIslandUpdateInput = {
                name: '업데이트된 섬 이름',
                description: '업데이트된 섬 설명',
                coverImage: 'https://example.com/updated-cover.jpg',
                maxMembers: 1,
            };

            await expect(() =>
                islandService.update(island.id, user.id, input),
            ).rejects.toThrow(
                new DomainException(
                    DomainExceptionType.TOO_MANY_PARTICIPANTS,
                    HttpStatus.BAD_REQUEST,
                    TOO_MANY_PARTICIPANTS_MESSAGE,
                ),
            );
        });
    });
});
