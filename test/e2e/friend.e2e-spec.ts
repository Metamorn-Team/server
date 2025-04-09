import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { generateUserEntity } from 'test/helper/generators';
import { login } from 'test/helper/login';
import { SendFriendRequest } from 'src/presentation/dto/friends/request/send-friend.request';

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
    });
});
