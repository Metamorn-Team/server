import * as request from 'supertest';

import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { generateUserEntity } from 'test/helper/generators';
import { login } from 'test/helper/login';
import { SendFriendRequest } from 'src/presentation/dto/friends/request/send-friend.request';
import { v4 } from 'uuid';

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
    });

    describe('POST /friends/requests', () => {
        it('친구 요청을 전송 정상 동작', async () => {
            const { accessToken, userId } = await login(app);

            const recivedUser = await prisma.user.create({
                data: generateUserEntity(
                    'reciver@email.com',
                    'testNickname',
                    'testTag',
                ),
            });

            const dto: SendFriendRequest = {
                targetUserId: recivedUser.id,
            };

            const response = await request(app.getHttpServer())
                .post('/friends/requests')
                .send(dto)
                .set('Authorization', accessToken);

            const { status } = response;
            const createdFriendRequest = await prisma.friendRequest.findFirst({
                where: {
                    senderId: userId,
                    receiverId: recivedUser.id,
                },
            });

            expect(status).toBe(204);
            expect(createdFriendRequest).not.toBeNull();
        });

        it('이미 보낸 요청이 있을 경우 409 Conflict 에러 반환', async () => {
            const { accessToken, userId } = await login(app);

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
                    senderId: userId,
                    receiverId: receivedUser.id,
                    status: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            const response = await request(app.getHttpServer())
                .post('/friends/requests')
                .send(dto)
                .set('Authorization', accessToken);

            expect(response.status).toBe(HttpStatus.CONFLICT);

            const requestCount = await prisma.friendRequest.count({
                where: {
                    senderId: userId,
                    receiverId: receivedUser.id,
                },
            });
            expect(requestCount).toBe(1);
        });

        it('자신에게 친구 요청을 보낼 경우 400 Bad Request 에러 반환', async () => {
            const { accessToken, userId } = await login(app);

            const dto: SendFriendRequest = {
                targetUserId: userId,
            };

            const response = await request(app.getHttpServer())
                .post('/friends/requests')
                .send(dto)
                .set('Authorization', accessToken);

            expect(response.status).toBe(HttpStatus.BAD_REQUEST); // 400 확인
        });
    });
});
