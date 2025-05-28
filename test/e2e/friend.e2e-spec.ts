/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
    generateFriendship,
    generateUserEntity,
    generateUserEntityV2,
} from 'test/helper/generators';
import { login } from 'test/helper/login';
import { SendFriendRequest } from 'src/presentation/dto/friends/request/send-friend.request';
import { v4 } from 'uuid';
import {
    FriendRequestDirection,
    GetFriendRequestListRequest,
    GetFriendRequestsResponse,
    GetFriendsResponse,
    GetUnreadRequestResponse,
} from 'src/presentation/dto/friends';
import {
    FriendRequest as FriendRequestPrisma,
    FriendRequestStatus,
    User,
} from '@prisma/client';
import { ResponseResult } from 'test/helper/types';
import { CheckFriendshipResponse } from 'src/presentation/dto/friends/response/check-friendship.response';

describe('FriendController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await prisma.friendRequest.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('POST /friends/requests', () => {
        it('친구 요청을 전송 정상 동작', async () => {
            const currentUser = await login(app);

            const receivedUser = await prisma.user.create({
                data: generateUserEntity(
                    'receiver@email.com',
                    'testNickname',
                    'testTag',
                ),
            });

            const dto: SendFriendRequest = {
                targetUserId: receivedUser.id,
            };

            const response = await request(app.getHttpServer())
                .post('/friends/requests')
                .send(dto)
                .set('Authorization', currentUser.accessToken);

            const { status } = response;
            const createdFriendRequest = await prisma.friendRequest.findFirst({
                where: {
                    senderId: currentUser.userId,
                    receiverId: receivedUser.id,
                },
            });

            expect(status).toBe(HttpStatus.NO_CONTENT);
            expect(createdFriendRequest).not.toBeNull();
        });

        it('이미 보낸 요청이 있을 경우 409 Conflict 에러 반환', async () => {
            const currentUser = await login(app);

            const receivedUser = await prisma.user.create({
                data: generateUserEntity(
                    'receiver_conflict@email.com',
                    'conflictNickname',
                    'conflictTag',
                ),
            });

            const dto: SendFriendRequest = {
                targetUserId: receivedUser.id,
            };

            await prisma.friendRequest.create({
                data: {
                    id: v4(),
                    senderId: currentUser.userId,
                    receiverId: receivedUser.id,
                    status: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            const response = await request(app.getHttpServer())
                .post('/friends/requests')
                .send(dto)
                .set('Authorization', currentUser.accessToken);

            expect(response.status).toBe(HttpStatus.CONFLICT);

            const requestCount = await prisma.friendRequest.count({
                where: {
                    senderId: currentUser.userId,
                    receiverId: receivedUser.id,
                },
            });
            expect(requestCount).toBe(1);
        });

        it('자신에게 친구 요청을 보낼 경우 400 Bad Request 에러 반환', async () => {
            const currentUser = await login(app);

            const dto: SendFriendRequest = {
                targetUserId: currentUser.userId,
            };

            const response = await request(app.getHttpServer())
                .post('/friends/requests')
                .send(dto)
                .set('Authorization', currentUser.accessToken);

            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('거절 상태의 요청이 존재하는 경우에도 재요청이 가능하다', async () => {
            const currentUser = await login(app);

            const receivedUser = await prisma.user.create({
                data: generateUserEntity(
                    'receiver_conflict@email.com',
                    'conflictNickname',
                    'conflictTag',
                ),
            });

            await prisma.friendRequest.create({
                data: generateFriendship(currentUser.userId, receivedUser.id, {
                    status: 'REJECTED',
                }),
            });

            const dto: SendFriendRequest = {
                targetUserId: receivedUser.id,
            };

            const response = await request(app.getHttpServer())
                .post('/friends/requests')
                .send(dto)
                .set('Authorization', currentUser.accessToken);

            const requestCount = await prisma.friendRequest.count({
                where: {
                    senderId: currentUser.userId,
                    receiverId: receivedUser.id,
                },
            });

            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(requestCount).toBe(2);
        });
    });

    describe('GET /friends/requests - 친구 요청 목록 조회 (정상 동작)', () => {
        const users = Array.from({ length: 10 }, (_, i) =>
            generateUserEntityV2({
                email: `test${i}@test.com`,
                nickname: `nick${i}`,
                tag: `tag${i}`,
            }),
        );

        beforeEach(async () => {
            await prisma.user.createMany({ data: users });
        });

        it('받은 친구 요청 목록을 정상적으로 조회한다', async () => {
            const { accessToken, userId } = await login(app);

            const receivedReqeusts = users.map((user) =>
                generateFriendship(user.id, userId),
            );
            await prisma.friendRequest.createMany({ data: receivedReqeusts });

            const query: GetFriendRequestListRequest = {
                direction: FriendRequestDirection.RECEIVED,
                limit: 10,
            };
            const response = (await request(app.getHttpServer())
                .get('/friends/requests')
                .query(query)
                .set('Authorization', accessToken)
                .expect(
                    HttpStatus.OK,
                )) as ResponseResult<GetFriendRequestsResponse>;
            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.data.length).toEqual(receivedReqeusts.length);
        });

        it('보낸 친구 요청 목록을 정상적으로 조회한다', async () => {
            const { accessToken, userId } = await login(app);

            const sentReqeusts = users.map((user) =>
                generateFriendship(userId, user.id),
            );
            await prisma.friendRequest.createMany({ data: sentReqeusts });

            const query: GetFriendRequestListRequest = {
                direction: FriendRequestDirection.SENT,
                limit: 10,
            };
            const response = (await request(app.getHttpServer())
                .get('/friends/requests')
                .query(query)
                .set('Authorization', accessToken)
                .expect(
                    HttpStatus.OK,
                )) as ResponseResult<GetFriendRequestsResponse>;
            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.data.length).toEqual(sentReqeusts.length);
        });

        it('인증 토큰 없이 요청 시 401 Unauthorized 에러를 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/friends/requests')
                .query({ direction: FriendRequestDirection.RECEIVED })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('잘못된 direction 값을 사용하면 400 Bad Request 에러를 반환한다', async () => {
            const currentUser = await login(app);
            await request(app.getHttpServer())
                .get('/friends/requests')
                .query({ direction: 'invalid_direction' })
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('direction 파라미터가 누락되면 400 Bad Request 에러를 반환한다', async () => {
            const currentUser = await login(app);
            await request(app.getHttpServer())
                .get('/friends/requests')
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('limit 파라미터에 숫자가 아닌 값을 넣으면 400 Bad Request 에러를 반환한다', async () => {
            const currentUser = await login(app);
            await request(app.getHttpServer())
                .get('/friends/requests')
                .query({
                    direction: FriendRequestDirection.RECEIVED,
                    limit: 'abc',
                })
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('limit 파라미터에 0 이하의 값을 넣으면 400 Bad Request 에러를 반환한다', async () => {
            const currentUser = await login(app);
            await request(app.getHttpServer())
                .get('/friends/requests')
                .query({ direction: FriendRequestDirection.RECEIVED, limit: 0 })
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PATCH /friends/requests/:targetId/accept - 친구 요청 수락', () => {
        let currentUser: { accessToken: string; userId: string };
        const user = generateUserEntityV2();

        beforeEach(async () => {
            await prisma.user.create({ data: user });
            currentUser = await login(app);
        });

        it('친구 요청을 정상적으로 수락한다', async () => {
            const friendRequest = generateFriendship(
                user.id,
                currentUser.userId,
                { status: 'PENDING' },
            );
            await prisma.friendRequest.create({ data: friendRequest });

            const response = await request(app.getHttpServer())
                .patch(`/friends/requests/${user.id}/accept`)
                .set('Authorization', currentUser.accessToken);

            const updatedRequest = await prisma.friendRequest.findUnique({
                where: { id: friendRequest.id },
            });

            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(updatedRequest?.status).toBe(FriendRequestStatus.ACCEPTED);
            expect(updatedRequest?.updatedAt).not.toEqual(
                friendRequest.updatedAt,
            );
        });

        it('존재하지 않는 친구 요청 ID로 수락 시 404 Not Found 에러를 반환한다', async () => {
            const nonExistentRequestId = v4();
            const response = await request(app.getHttpServer())
                .patch(`/friends/requests/${nonExistentRequestId}/accept`)
                .set('Authorization', currentUser.accessToken);
            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });

        it('이미 수락된 요청을 다시 수락시 404 Not Found 에러를 반환한다', async () => {
            const friendRequest = generateFriendship(
                user.id,
                currentUser.userId,
                { status: 'ACCEPTED' },
            );
            await prisma.friendRequest.create({ data: friendRequest });

            const requestId = friendRequest.id;
            const response = await request(app.getHttpServer())
                .patch(`/friends/requests/${requestId}/accept`)
                .set('Authorization', currentUser.accessToken);
            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });

        it('자신이 보내지 않고 받지도 않은 요청을 수락 시 404 Not Found 에러를 반환한다', async () => {
            const userOther1 = await prisma.user.create({
                data: generateUserEntity(
                    'other1@test.com',
                    'Other1',
                    'tag_other1',
                ),
            });
            const userOther2 = await prisma.user.create({
                data: generateUserEntity(
                    'other2@test.com',
                    'Other2',
                    'tag_other2',
                ),
            });
            const otherRequest = await prisma.friendRequest.create({
                data: {
                    id: v4(),
                    senderId: userOther1.id,
                    receiverId: userOther2.id,
                    status: FriendRequestStatus.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            const requestId = otherRequest.id;
            const response = await request(app.getHttpServer())
                .patch(`/friends/requests/${requestId}/accept`)
                .set('Authorization', currentUser.accessToken);
            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });

        it('인증 없이 요청 시 401 Unauthorized 에러를 반환한다', async () => {
            const response = await request(app.getHttpServer()).patch(
                `/friends/requests/${'test'}/accept`,
            );
            expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });
    });

    describe('PATCH /friends/requests/:requestId/reject - 친구 요청 거절', () => {
        let currentUser: {
            userId: string;
            accessToken: string;
        };
        const senderUser = generateUserEntityV2();

        beforeEach(async () => {
            currentUser = await login(app);
            await prisma.user.create({ data: senderUser });
        });

        it('친구 요청을 정상적으로 거절한다', async () => {
            const friendRequest = generateFriendship(
                senderUser.id,
                currentUser.userId,
            );
            await prisma.friendRequest.create({ data: friendRequest });

            const response = await request(app.getHttpServer())
                .patch(`/friends/requests/${friendRequest.id}/reject`)
                .set('Authorization', currentUser.accessToken);

            expect(response.status).toBe(HttpStatus.NO_CONTENT);

            const updatedRequest = await prisma.friendRequest.findUnique({
                where: { id: friendRequest.id },
            });
            expect(updatedRequest).not.toBeNull();
            expect(updatedRequest?.status).toBe(FriendRequestStatus.REJECTED);
            expect(updatedRequest?.updatedAt).not.toEqual(
                friendRequest.updatedAt,
            );
        });
    });

    describe('DELETE /friends/:friendshipId - 친구 삭제', () => {
        let currentUser: {
            userId: string;
            accessToken: string;
        };
        const user = generateUserEntityV2();

        beforeEach(async () => {
            currentUser = await login(app);
            await prisma.user.create({ data: user });
        });

        it('친구를 정상적으로 삭제한다 (204 NO CONTENT)', async () => {
            const friend = generateFriendship(user.id, currentUser.userId, {
                status: 'ACCEPTED',
            });
            await prisma.friendRequest.create({ data: friend });

            const response = await request(app.getHttpServer())
                .delete(`/friends/${friend.id}`)
                .set('Authorization', currentUser.accessToken);

            expect(response.status).toBe(HttpStatus.NO_CONTENT);

            const deletedFriendship = await prisma.friendRequest.findUnique({
                where: { id: friend.id },
            });
            expect(deletedFriendship).not.toBeNull();
            expect(deletedFriendship?.deletedAt).not.toBeNull();
        });

        it('존재하지 않는 친구 관계 ID로 삭제 시도 시 404 Not Found 에러를 반환한다', async () => {
            const nonExistentFriendshipId = v4();

            const response = await request(app.getHttpServer())
                .delete(`/friends/${nonExistentFriendshipId}`)
                .set('Authorization', currentUser.accessToken);

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });

        it('인증 없이 친구 삭제 요청 시 401 Unauthorized 에러를 반환한다', async () => {
            const response = await request(app.getHttpServer()).delete(
                `/friends/${'test'}`,
            );

            expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });
    });

    describe('GET /friends - 친구 목록 조회', () => {
        let currentUser: {
            userId: string;
            accessToken: string;
            nickname: string;
            tag: string;
        };

        beforeEach(async () => {
            currentUser = await login(app);
        });

        const seedFriends = async (count: number) => {
            const userId = currentUser.userId;
            const friendUsers: User[] = [];
            const friendships: FriendRequestPrisma[] = [];

            for (let i = 0; i < count; i++) {
                const friend = await prisma.user.create({
                    data: generateUserEntity(
                        `friend${i}@test.com`,
                        `Friend${i}`,
                        `tag_friend_${i}`,
                        'GOOGLE',
                        'pawn',
                        new Date(Date.now() - i * 1000),
                    ),
                });
                friendUsers.push(friend);

                const senderId = i % 2 === 0 ? userId : friend.id;
                const receiverId = i % 2 === 0 ? friend.id : userId;

                const friendship = await prisma.friendRequest.create({
                    data: {
                        id: v4(),
                        senderId: senderId,
                        receiverId: receiverId,
                        status: 'ACCEPTED',
                        createdAt: new Date(Date.now() - (count - i) * 2000),
                        updatedAt: new Date(Date.now() - i * 1000),
                    },
                });
                friendships.push(friendship);
            }
            friendships.sort(
                (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
            );
            return { friendUsers, friendships };
        };

        it('친구 목록을 정상적으로 조회한다 (페이지네이션 x)', async () => {
            const friendCount = 3;
            const { friendUsers, friendships } = await seedFriends(friendCount);

            const expectedFriendsData = friendships.map((friendship, index) => {
                const friendUser = friendUsers[index];
                return {
                    id: friendUser.id,
                    nickname: friendUser.nickname,
                    tag: friendUser.tag,
                    avatarKey: friendUser.avatarKey,
                    friendshipId: friendship.id,
                    becameFriendAt: friendship.updatedAt.toISOString(),
                    isOnline: false,
                };
            });

            const response = (await request(app.getHttpServer())
                .get('/friends')
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.OK)) as ResponseResult<GetFriendsResponse>;

            const actualFriendsData = response.body.data.map((friend) => ({
                ...friend,
                becameFriendAt: new Date(friend.becameFriendAt).toISOString(),
            }));

            expect(actualFriendsData).toHaveLength(friendCount);
            expect(actualFriendsData).toEqual(expectedFriendsData);
            expect(response.body.nextCursor).toBeNull();
        });

        it('친구가 없을 경우 빈 목록과 null cursor를 반환한다', async () => {
            const response = await request(app.getHttpServer())
                .get('/friends')
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.OK);

            const body = response.body as GetFriendsResponse;

            expect(body.data).toEqual([]);
            expect(body.nextCursor).toBeNull();
        });

        it('페이지네이션: limit를 사용하여 첫 페이지 조회한다', async () => {
            const totalFriends = 7;
            const limit = 5;
            const { friendUsers, friendships } =
                await seedFriends(totalFriends);

            const expectedFirstPageData = friendships
                .slice(0, limit)
                .map((friendship, index) => {
                    const friendUser = friendUsers[index];
                    return {
                        id: friendUser.id,
                        nickname: friendUser.nickname,
                        tag: friendUser.tag,
                        avatarKey: friendUser.avatarKey,
                        friendshipId: friendship.id,
                        becameFriendAt: friendship.updatedAt.toISOString(),
                        isOnline: false,
                    };
                });

            const response = await request(app.getHttpServer())
                .get('/friends')
                .query({ limit })
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.OK);

            const body = response.body as GetFriendsResponse;

            const actualFriendsData = body.data.map((friend) => ({
                ...friend,
                becameFriendAt: new Date(friend.becameFriendAt).toISOString(),
            }));

            expect(actualFriendsData).toHaveLength(limit);
            expect(actualFriendsData).toEqual(expectedFirstPageData);
            expect(body.nextCursor).not.toBeNull();
            expect(typeof body.nextCursor).toBe('string');
            expect(body.nextCursor).toBe(friendships[limit].id);
        });

        it('페이지네이션: limit와 cursor를 사용하여 다음 페이지 조회하고 해당 페이지 데이터를 검증한다', async () => {
            const totalFriends = 7;
            const limit = 5;
            const { friendUsers, friendships } =
                await seedFriends(totalFriends);

            const firstResponse = (await request(app.getHttpServer())
                .get('/friends')
                .query({ limit })
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.OK)) as ResponseResult<GetFriendsResponse>;
            const cursor = firstResponse.body.nextCursor;

            expect(cursor).not.toBeNull();

            const expectedSecondPageData = friendships
                .slice(limit, limit + limit)
                .map((friendship, index) => {
                    const friendUser = friendUsers[limit + index];
                    return {
                        id: friendUser.id,
                        nickname: friendUser.nickname,
                        tag: friendUser.tag,
                        avatarKey: friendUser.avatarKey,
                        friendshipId: friendship.id,
                        becameFriendAt: friendship.updatedAt.toISOString(),
                        isOnline: false,
                    };
                });

            const secondResponse = await request(app.getHttpServer())
                .get('/friends')
                .query({ limit, cursor }) // cursor 적용
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.OK);

            const secondBody = secondResponse.body as GetFriendsResponse;

            const actualSecondPageData = secondBody.data.map((friend) => ({
                ...friend,
                becameFriendAt: new Date(friend.becameFriendAt).toISOString(),
            }));

            expect(actualSecondPageData).toHaveLength(totalFriends - limit);
            expect(actualSecondPageData).toEqual(expectedSecondPageData);
            expect(secondBody.nextCursor).toBeNull();
        });

        it('인증 토큰 없이 요청 시 401 Unauthorized 에러를 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/friends')
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('limit 파라미터에 숫자가 아닌 값을 넣으면 400 Bad Request 에러를 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/friends')
                .query({ limit: 'abc' })
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('limit 파라미터에 0 이하의 값을 넣으면 400 Bad Request 에러를 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/friends')
                .query({ limit: 0 })
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST);

            await request(app.getHttpServer())
                .get('/friends')
                .query({ limit: -1 })
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    describe('GET /friends/check - 친구 여부 확인', () => {
        const targetUser = generateUserEntityV2();

        beforeEach(async () => {
            await prisma.user.create({
                data: targetUser,
            });
        });

        it('친구 요청을 보낸 경우', async () => {
            const { userId, accessToken } = await login(app);

            const friendship = generateFriendship(userId, targetUser.id, {
                status: 'PENDING',
            });
            await prisma.friendRequest.create({
                data: friendship,
            });

            const response = (await request(app.getHttpServer())
                .get('/friends/check')
                .query({ targetId: targetUser.id })
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<CheckFriendshipResponse>;
            const { body, status } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(body.status).toEqual('SENT');
        });

        it('친구 요청을 받은 경우', async () => {
            const { userId, accessToken } = await login(app);

            const friendship = generateFriendship(targetUser.id, userId, {
                status: 'PENDING',
            });
            await prisma.friendRequest.create({
                data: friendship,
            });

            const response = (await request(app.getHttpServer())
                .get('/friends/check')
                .query({ targetId: targetUser.id })
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<CheckFriendshipResponse>;
            const { body, status } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(body.status).toEqual('RECEIVED');
        });

        it('친구인 경우', async () => {
            const { userId, accessToken } = await login(app);

            const friendship = generateFriendship(userId, targetUser.id, {
                status: 'ACCEPTED',
            });
            await prisma.friendRequest.create({
                data: friendship,
            });

            const response = (await request(app.getHttpServer())
                .get('/friends/check')
                .query({ targetId: targetUser.id })
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<CheckFriendshipResponse>;
            const { body, status } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(body.status).toEqual('ACCEPTED');
        });

        it('둘 사이의 요청이 없는 경우', async () => {
            const { accessToken } = await login(app);

            const response = (await request(app.getHttpServer())
                .get('/friends/check')
                .query({ targetId: targetUser.id })
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<CheckFriendshipResponse>;
            const { body, status } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(body.status).toEqual('NONE');
        });
    });

    describe('GET /friends/unread-count - 확인하지 않은 친구 요청 수 조회', () => {
        it('요청 수 조회 정상 동작', async () => {
            const { accessToken, userId } = await login(app);

            const users = Array.from({ length: 5 }, (_, i) =>
                generateUserEntityV2({
                    email: `test${i}@test.com`,
                    tag: `tag${i}`,
                }),
            );
            await prisma.user.createMany({ data: users });
            const requests = Array.from({ length: 5 }, (_, i) =>
                generateFriendship(users[i].id, userId, { status: 'PENDING' }),
            );
            await prisma.friendRequest.createMany({ data: requests });

            const response = (await request(app.getHttpServer())
                .get('/friends/unread-count')
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetUnreadRequestResponse>;
            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.count).toEqual(requests.length);
        });
    });

    describe('GET /friends/unread-count - 확인하지 않은 친구 요청 수 조회', () => {
        it('요청 수 조회 정상 동작', async () => {
            const { accessToken, userId } = await login(app);

            const users = Array.from({ length: 5 }, (_, i) =>
                generateUserEntityV2({
                    email: `test${i}@test.com`,
                    tag: `tag${i}`,
                }),
            );
            await prisma.user.createMany({ data: users });
            const requests = Array.from({ length: 5 }, (_, i) =>
                generateFriendship(users[i].id, userId, { status: 'PENDING' }),
            );
            await prisma.friendRequest.createMany({ data: requests });

            const response = (await request(app.getHttpServer())
                .get('/friends/unread-count')
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetUnreadRequestResponse>;
            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.count).toEqual(requests.length);
        });
    });

    describe('PATCH /friends/read - 모든 친구 요청 읽음 처리', () => {
        it('요청 읽음 처리 정상 동작', async () => {
            const { accessToken, userId } = await login(app);

            const users = Array.from({ length: 5 }, (_, i) =>
                generateUserEntityV2({
                    email: `test${i}@test.com`,
                    tag: `tag${i}`,
                }),
            );
            await prisma.user.createMany({ data: users });
            const requests = Array.from({ length: 5 }, (_, i) =>
                generateFriendship(users[i].id, userId, { status: 'PENDING' }),
            );
            await prisma.friendRequest.createMany({ data: requests });

            const response = await request(app.getHttpServer())
                .patch('/friends/read')
                .set('Authorization', accessToken);
            const { status } = response;

            const count = await prisma.friendRequest.count({
                where: {
                    receiverId: userId,
                    isRead: false,
                },
            });

            expect(status).toEqual(200);
            expect(count).toEqual(0);
        });
    });
});
