import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Map } from '@prisma/client';
import Redis from 'ioredis';
import { v4 } from 'uuid';
import { NormalIslandPrototype } from 'src/domain/entities/islands/island.entity';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { TAG_AT_LEAST_ONE_MESSAGE } from 'src/domain/exceptions/message';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { GameIslandCreateService } from 'src/domain/services/game/game-island-create.service';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import { GameIslandCreateServiceModule } from 'src/modules/game/game-island-create-service.module';
import { generateTag, generateUserEntityV2 } from 'test/helper/generators';
import { COMMON_IMPORTS } from 'test/unit/services/commom-imports';

describe('GameIslandService', () => {
    let app: TestingModule;
    let db: PrismaService;
    let redis: Redis;
    let gameIslandCreateService: GameIslandCreateService;
    let normalIslandStorage: NormalIslandStorage;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [GameIslandCreateServiceModule, ...COMMON_IMPORTS],
        }).compile();

        db = app.get<PrismaService>(PrismaService);
        redis = app.get<RedisClientService>(RedisClientService).getClient();
        gameIslandCreateService = app.get<GameIslandCreateService>(
            GameIslandCreateService,
        );
        normalIslandStorage = app.get<NormalIslandStorage>(NormalIslandStorage);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await redis.flushall();
        await db.islandTag.deleteMany();
        await db.playerSpawnPoint.deleteMany();
        await db.island.deleteMany();
        await db.map.deleteMany();
        await db.tag.deleteMany();
        await db.user.deleteMany();
    });

    describe('섬 생성', () => {
        const user = generateUserEntityV2();
        const tag = generateTag('자유');
        let map: Map;

        beforeEach(async () => {
            await db.user.create({ data: user });
            await db.tag.create({ data: tag });
            map = await db.map.create({
                data: {
                    id: v4(),
                    key: 'island',
                    name: '섬',
                    description: '섬 설명',
                    image: 'https://example.com/image.png',
                    createdAt: new Date(),
                },
            });
        });

        it('섬 생성 정상 동작', async () => {
            const prototype: NormalIslandPrototype = {
                maxMembers: 5,
                type: IslandTypeEnum.NORMAL,
                coverImage: 'https://example.com/cover.jpg',
                description: '섬 설명',
                name: '섬 이름',
                ownerId: user.id,
                mapKey: map.key,
            };

            await gameIslandCreateService.create(prototype, [tag.name]);

            const createdIslandInDb = await db.island.findFirst();
            const createdIslandInMemory = await normalIslandStorage.getIsland(
                createdIslandInDb!.id,
            );

            expect(createdIslandInDb?.id).toBeTruthy();
            expect(createdIslandInDb?.id).toEqual(createdIslandInMemory?.id);
        });

        it('태그가 1가 미만인 경우 예외가 발생한다.', async () => {
            const prototype: NormalIslandPrototype = {
                maxMembers: 5,
                type: IslandTypeEnum.NORMAL,
                coverImage: 'https://example.com/cover.jpg',
                description: '섬 설명',
                name: '섬 이름',
                ownerId: user.id,
                mapKey: map.key,
            };

            await expect(
                gameIslandCreateService.create(prototype, []),
            ).rejects.toThrow(
                new DomainException(
                    DomainExceptionType.TAG_AT_LEAST_ONE,
                    HttpStatus.BAD_REQUEST,
                    TAG_AT_LEAST_ONE_MESSAGE,
                ),
            );
        });
    });
});
