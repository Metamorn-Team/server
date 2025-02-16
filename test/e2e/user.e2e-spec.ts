import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { login } from 'test/helper/login';
import { ChangeNicknameRequest } from 'src/presentation/dto/user/request/change-nickname.request';
import { ChangeTagRequest } from 'src/presentation/dto/user/request/change-tag.request';
import { generateUserEntity } from 'test/helper/generators';

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

    afterAll(() => {
        app.close();
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

    describe('(PATCH) /user/tag - 태그 변경', () => {
        it('태그 변경 정상 동작', async () => {
            const { accessToken } = await login(app);

            const dto: ChangeTagRequest = {
                tag: 'new_tag',
            };

            const response = await request(app.getHttpServer())
                .patch('/user/tag')
                .send(dto)
                .set('Authorization', accessToken);
            const { status } = response;
            const updatedUser = await prisma.user.findFirst({
                where: {
                    tag: 'new_tag',
                },
            });

            expect(status).toEqual(204);
            expect(updatedUser).not.toBeNull();
        });

        it('동일한 태그로 변경시 에러 동작', async () => {
            // login 헬퍼를 통해 사용자 생성 (태그: 'metamorn')
            const { accessToken } = await login(app);

            // 동일한 태그로 변경 요청
            const dto: ChangeTagRequest = {
                tag: 'metamorn', // login 헬퍼에서 생성된 사용자의 태그와 동일
            };

            const response = await request(app.getHttpServer())
                .patch('/user/tag')
                .send(dto)
                .set('Authorization', accessToken);
            const { status, body } = response;

            expect(status).toEqual(409);
            expect(body.message).toEqual('이미 사용 중인 태그입니다.');
        });

        it('다른 사용자 태그로 변경시 에러 동작', async () => {
            const { accessToken } = await login(app);

            const user = await prisma.user.create({
                data: generateUserEntity('test@email.com', 'test', '11111'),
            });

            const dto: ChangeTagRequest = {
                tag: user.tag,
            };

            const response = await request(app.getHttpServer())
                .patch('/user/tag')
                .send(dto)
                .set('Authorization', accessToken);
            const { status, body } = response;

            expect(status).toEqual(409);
        });
    });
});
