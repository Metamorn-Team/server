import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { login } from 'test/helper/login';
import { ChangeNicknameRequest } from 'src/presentation/dto/user/request/change-nickname.request';

describe('UserController (e2e)', () => {
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

    afterEach(async () => {
        await prisma.user.deleteMany();
    });

    describe('(PATCH) /user/nickname - 닉네임 변경', () => {
        it('닉네임 변경 정상 동작', async () => {
            const { accessToken } = await login(app);

            const dto: ChangeNicknameRequest = {
                nickname: 'new_nickname',
            };

            const response = await request(app.getHttpServer())
                .patch('/user/nickname')
                .send(dto)
                .set('Authorization', accessToken);
            const { status } = response;
            const updatedUser = await prisma.user.findFirst({
                where: {
                    nickname: 'new_nickname',
                },
            });

            expect(status).toEqual(204);
            expect(updatedUser).not.toBeNull();
        });
    });
});
