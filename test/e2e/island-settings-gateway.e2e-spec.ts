/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
    generateIsland,
    generateNormalIslandModel,
    generateUserEntityV2,
} from 'test/helper/generators';
import Redis from 'ioredis';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import {
    createSocketConnection,
    TypedSockect,
    waitForEvent,
} from 'test/helper/socket';
import { UpdateIslandInfoRequest } from 'src/presentation/dto/island/request/update-island-info.request';
import { login } from 'test/helper/login';
import { FORBIDDEN_MESSAGE } from 'src/domain/exceptions/message';
import {
    WsErrorBody,
    WsExceptions,
} from 'src/presentation/dto/game/socket/known-exception';

describe('IslandSettingsGateway (e2e)', () => {
    let app: INestApplication;
    let normalIslandStorage: NormalIslandStorage;
    let db: PrismaService;
    let redis: Redis;
    let socket: TypedSockect;
    const serverPort = 8081;
    const url = `http://localhost:${serverPort}/island`;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        await app.listen(serverPort);

        normalIslandStorage = app.get<NormalIslandStorage>(NormalIslandStorage);
        db = app.get<PrismaService>(PrismaService);
        redis = app.get<RedisClientService>(RedisClientService).getClient();
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        socket.disconnect();
        await redis.flushall();
        await db.refreshToken.deleteMany();
        await db.islandTag.deleteMany();
        await db.island.deleteMany();
        await db.tag.deleteMany();
        await db.user.deleteMany();
    });

    describe('updateIslandInfo - 섬 정보 업데이트', () => {
        // TODO room에 to emit하는 건 검증 방법 고민해보기
        // it('섬 정보 업데이트 정상 동작', async () => {
        //     const { accessToken, userId } = await login(app);
        //     socket = await createSocketConnection(url, app, accessToken);

        //     const island = generateIsland({ ownerId: userId });
        //     const normalIsland = generateNormalIslandModel({
        //         id: island.id,
        //         ownerId: island.ownerId,
        //         name: island.name,
        //         coverImage: island.coverImage,
        //         description: island.description,
        //         max: island.maxMembers,
        //     });

        //     await db.island.create({ data: island });
        //     await normalIslandStorage.createIsland(normalIsland);

        //     const updateData: UpdateIslandInfoRequest = {
        //         id: island.id,
        //         name: '업데이트된 섬 이름',
        //         description: '업데이트된 설명',
        //         maxMembers: 3,
        //         coverImage: 'https://example.com/new-image.png',
        //     };

        //     socket.emit('updateIslandInfo', updateData);

        //     const response = await waitForEvent<{ islandId: string }>(
        //         socket,
        //         'islandInfoUpdated',
        //     );

        //     const updatedIsland = await normalIslandStorage.getIsland(
        //         island.id,
        //     );

        //     expect(updatedIsland?.name).toEqual(updateData.name);
        //     expect(updatedIsland?.description).toEqual(updateData.description);
        //     expect(updatedIsland?.max).toEqual(updateData.maxMembers);
        //     expect(updatedIsland?.coverImage).toEqual(updateData.coverImage);
        // });

        it('권한이 없는 사용자가 업데이트 시도 시 예외가 발생한다', async () => {
            const { accessToken } = await login(app);
            socket = await createSocketConnection(url, app, accessToken);

            const owner = generateUserEntityV2();
            const island = generateIsland({ ownerId: owner.id });
            const normalIsland = generateNormalIslandModel({
                id: island.id,
                ownerId: island.ownerId,
                name: island.name,
                coverImage: island.coverImage,
                description: island.description,
                max: island.maxMembers,
            });

            await db.user.create({ data: owner });
            await db.island.create({ data: island });
            await normalIslandStorage.createIsland(normalIsland);

            const updateData: UpdateIslandInfoRequest = {
                id: island.id,
                name: '권한이 없다네',
            };

            socket.emit('updateIslandInfo', updateData);

            const error = await waitForEvent<{ name: string; message: string }>(
                socket,
                'wsError',
            );

            expect(error.name).toEqual('UNKNOWN');
            expect(error.message).toEqual(FORBIDDEN_MESSAGE);
        });

        it('변경하려는 최대 인원 수가 현재 참여 인원 수보다 작은 경우 예외가 발생한다', async () => {
            const { accessToken, userId: ownerId } = await login(app);
            socket = await createSocketConnection(url, app, accessToken);

            const owner = generateUserEntityV2();
            const island = generateIsland({ ownerId, maxMembers: 2 });
            const normalIsland = generateNormalIslandModel({
                id: island.id,
                ownerId: island.ownerId,
                name: island.name,
                coverImage: island.coverImage,
                description: island.description,
                max: island.maxMembers,
            });

            await db.user.create({ data: owner });
            await db.island.create({ data: island });
            await normalIslandStorage.createIsland(normalIsland);

            await normalIslandStorage.addPlayerToIsland(island.id, 'player1');
            await normalIslandStorage.addPlayerToIsland(island.id, 'player2');

            const updateData: UpdateIslandInfoRequest = {
                id: island.id,
                maxMembers: 1,
            };

            socket.emit('updateIslandInfo', updateData);

            const error = await waitForEvent<{ name: string; message: string }>(
                socket,
                'wsError',
            );

            expect(error.name).toEqual(WsExceptions.TOO_MANY_PARTICIPANTS);
        });

        describe('입력감 검증', () => {
            const islandId = 'b1c2d3e4-f5g6-7h8i-9j0k-l1m2n3o4p5q6';

            beforeEach(async () => {
                const { accessToken } = await login(app);
                socket = await createSocketConnection(url, app, accessToken);
            });

            it('UUID 형식이 아닌 id - 실패', async () => {
                const invalidRequest: UpdateIslandInfoRequest = {
                    id: 'invalid-uuid',
                    name: '유효하지 않은 ID 테스트',
                };

                socket.emit('updateIslandInfo', invalidRequest);
                const error = await waitForEvent<WsErrorBody>(
                    socket,
                    'wsError',
                );

                expect(error.name).toEqual(WsExceptions.BAD_INPUT);
            });

            it('maxMembers 범위 초과 (6) - 실패', async () => {
                const invalidRequest: UpdateIslandInfoRequest = {
                    id: islandId,
                    maxMembers: 6,
                };

                socket.emit('updateIslandInfo', invalidRequest);
                const error = await waitForEvent<WsErrorBody>(
                    socket,
                    'wsError',
                );

                expect(error.name).toEqual(WsExceptions.BAD_INPUT);
            });

            it('maxMembers 범위 미만 (0) - 실패', async () => {
                const invalidRequest: UpdateIslandInfoRequest = {
                    id: islandId,
                    maxMembers: 0,
                };

                socket.emit('updateIslandInfo', invalidRequest);
                const error = await waitForEvent<WsErrorBody>(
                    socket,
                    'wsError',
                );

                expect(error.name).toEqual(WsExceptions.BAD_INPUT);
            });

            it('name 길이 초과 (50자 이상) - 실패', async () => {
                const invalidRequest: UpdateIslandInfoRequest = {
                    id: islandId,
                    name: 'a'.repeat(51),
                };

                socket.emit('updateIslandInfo', invalidRequest);
                const error = await waitForEvent<WsErrorBody>(
                    socket,
                    'wsError',
                );

                expect(error.name).toEqual(WsExceptions.BAD_INPUT);
            });

            it('name 빈 문자열 - 실패', async () => {
                const invalidRequest: UpdateIslandInfoRequest = {
                    id: islandId,
                    name: '',
                };

                socket.emit('updateIslandInfo', invalidRequest);
                const error = await waitForEvent<WsErrorBody>(
                    socket,
                    'wsError',
                );

                expect(error.name).toEqual(WsExceptions.BAD_INPUT);
            });

            it('description 빈 문자열 - 실패', async () => {
                const invalidRequest: UpdateIslandInfoRequest = {
                    id: islandId,
                    description: '',
                };

                socket.emit('updateIslandInfo', invalidRequest);
                const error = await waitForEvent<WsErrorBody>(
                    socket,
                    'wsError',
                );

                expect(error.name).toEqual(WsExceptions.BAD_INPUT);
            });

            it('description 길이 초과 (200자 이상) - 실패', async () => {
                const invalidRequest: UpdateIslandInfoRequest = {
                    id: islandId,
                    description: 'a'.repeat(201),
                };

                socket.emit('updateIslandInfo', invalidRequest);
                const error = await waitForEvent<WsErrorBody>(
                    socket,
                    'wsError',
                );

                expect(error.name).toEqual(WsExceptions.BAD_INPUT);
            });

            it('유효하지 않은 URL 형식의 coverImage - 실패', async () => {
                const invalidRequest: UpdateIslandInfoRequest = {
                    id: islandId,
                    coverImage: 'invalid-url',
                };

                socket.emit('updateIslandInfo', invalidRequest);
                const error = await waitForEvent<WsErrorBody>(
                    socket,
                    'wsError',
                );

                expect(error.name).toEqual(WsExceptions.BAD_INPUT);
            });
        });
    });
});
