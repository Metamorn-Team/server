import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { generateUserEntity } from 'test/helper/generators';
import { login } from 'test/helper/login';
import { SendFriendRequest } from 'src/presentation/dto/friends/request/send-friend.request';
import { v4 } from 'uuid';
import {
    FriendRequestDirection,
    GetFriendRequestsResponse,
} from 'src/presentation/dto/friends';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import {
    FriendRequest as FriendRequestPrisma,
    FriendRequestStatus,
} from '@prisma/client';

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

    afterAll(() => {
        app.close();
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
    });

    describe('GET /friends/requests - 친구 요청 목록 조회 (정상 동작)', () => {
        let userB: UserEntity;
        let userC: UserEntity;
        let requestBtoA: FriendRequestPrisma;
        let requestAtoC: FriendRequestPrisma;

        const setupTestData = async (currentUserId: string) => {
            userB = await prisma.user.create({
                data: generateUserEntity('userB@test.com', 'UserB', 'tagB'),
            });
            userC = await prisma.user.create({
                data: generateUserEntity('userC@test.com', 'UserC', 'tagC'),
            });

            requestBtoA = await prisma.friendRequest.create({
                data: {
                    id: v4(),
                    senderId: userB.id,
                    receiverId: currentUserId,
                    status: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            requestAtoC = await prisma.friendRequest.create({
                data: {
                    id: v4(),
                    senderId: currentUserId,
                    receiverId: userC.id,
                    status: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        };

        it('받은 친구 요청 목록을 정상적으로 조회한다', async () => {
            const currentUser = await login(app);
            await setupTestData(currentUser.userId);

            const response = await request(app.getHttpServer())
                .get('/friends/requests')
                .query({ direction: FriendRequestDirection.RECEIVED })
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.OK);

            const body = response.body as GetFriendRequestsResponse;
            expect(body.data).toHaveLength(1);
            const requestItem = body.data[0];
            expect(requestItem.id).toBe(requestBtoA.id);
            expect(requestItem.user.id).toBe(userB.id);
            expect(requestItem.user.nickname).toBe(userB.nickname);
            expect(requestItem.user.tag).toBe(userB.tag);
            expect(body.nextCursor).toBeNull();
        });

        it('보낸 친구 요청 목록을 정상적으로 조회한다', async () => {
            const currentUser = await login(app);
            await setupTestData(currentUser.userId);

            const response = await request(app.getHttpServer())
                .get('/friends/requests')
                .query({ direction: FriendRequestDirection.SENT })
                .set('Authorization', currentUser.accessToken)
                .expect(HttpStatus.OK);

            const body = response.body as GetFriendRequestsResponse;
            expect(body.data).toHaveLength(1);
            const requestItem = body.data[0];
            expect(requestItem.id).toBe(requestAtoC.id);
            expect(requestItem.user.id).toBe(userC.id);
            expect(requestItem.user.nickname).toBe(userC.nickname);
            expect(requestItem.user.tag).toBe(userC.tag);
            expect(body.nextCursor).toBeNull();
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

    describe('PATCH /friends/requests/:requestId/accept - 친구 요청 수락', () => {
        let currentUser: {
            userId: string;
            accessToken: string;
            nickname: string;
            tag: string;
        };
        let senderUser: UserEntity;
        let friendRequest: FriendRequestPrisma;

        beforeEach(async () => {
            currentUser = await login(app);
            senderUser = await prisma.user.create({
                data: generateUserEntity(
                    'sender.patch@test.com',
                    'SenderPatch',
                    'tag_sender_patch',
                ),
            });

            friendRequest = await prisma.friendRequest.create({
                data: {
                    id: v4(),
                    senderId: senderUser.id,
                    receiverId: currentUser.userId,
                    status: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        });

        it('친구 요청을 정상적으로 수락한다', async () => {
            const requestId = friendRequest.id;
            const response = await request(app.getHttpServer())
                .patch(`/friends/requests/${requestId}/accept`)
                .set('Authorization', currentUser.accessToken);

            expect(response.status).toBe(HttpStatus.NO_CONTENT);

            const updatedRequest = await prisma.friendRequest.findUnique({
                where: { id: requestId },
            });
            expect(updatedRequest).not.toBeNull();
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
            await prisma.friendRequest.update({
                where: { id: friendRequest.id },
                data: { status: FriendRequestStatus.ACCEPTED },
            });

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
            const reqeustId = friendRequest.id;
            const response = await request(app.getHttpServer()).patch(
                `/friends/requests/${reqeustId}/accept`,
            );
            expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });
    });

    describe('PATCH /friends/requests/:requestId/reject - 친구 요청 거절', () => {
        let currentUser: {
            userId: string;
            accessToken: string;
            nickname: string;
            tag: string;
        };
        let senderUser: UserEntity;
        let friendRequest: FriendRequestPrisma;

        beforeEach(async () => {
            currentUser = await login(app);
            senderUser = await prisma.user.create({
                data: generateUserEntity(
                    'sender.patch@test.com',
                    'SenderPatch',
                    'tag_sender_patch',
                ),
            });

            friendRequest = await prisma.friendRequest.create({
                data: {
                    id: v4(),
                    senderId: senderUser.id,
                    receiverId: currentUser.userId,
                    status: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        });

        it('친구 요청을 정상적으로 거절한다', async () => {
            const requestId = friendRequest.id;
            const response = await request(app.getHttpServer())
                .patch(`/friends/requests/${requestId}/reject`)
                .set('Authorization', currentUser.accessToken);

            expect(response.status).toBe(HttpStatus.NO_CONTENT);

            const updatedRequest = await prisma.friendRequest.findUnique({
                where: { id: requestId },
            });
            expect(updatedRequest).not.toBeNull();
            expect(updatedRequest?.status).toBe(FriendRequestStatus.REJECTED);
            expect(updatedRequest?.updatedAt).not.toEqual(
                friendRequest.updatedAt,
            );
        });
    });
});
