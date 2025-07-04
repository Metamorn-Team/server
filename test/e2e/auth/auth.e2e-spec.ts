/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/infrastructure/prisma/prisma.service';
import { RegisterRequest } from '../../../src/presentation/dto/auth/request/register.request';
import { LoginRequest, RegisterResponse } from 'types';
import { OauthContext } from 'src/infrastructure/auth/context/auth-context';
import * as cookieParser from 'cookie-parser';
import { v4 } from 'uuid';
import { ResponseResult } from 'test/helper/types';
import { generateTag, randomString } from 'test/helper/random';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let oauthContext: OauthContext;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        oauthContext = moduleFixture.get<OauthContext>(OauthContext);
        await app.init();
    });

    afterAll(async () => {
        await prisma.$disconnect();
        await app.close();
    });

    afterEach(async () => {
        await prisma.refreshToken.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('POST /auth/register', () => {
        it('회원가입 성공', async () => {
            const sessionId = v4();
            const dto: RegisterRequest = {
                email: 'test@test.com',
                nickname: 'test',
                tag: 'test',
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            const agent = request.agent(app.getHttpServer());
            const response = await agent
                .post('/auth/register')
                .set('Cookie', `sessionId=${sessionId}`)
                .send(dto);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('email', dto.email);
            expect(response.body).toHaveProperty('nickname', dto.nickname);
            expect(response.body).toHaveProperty('tag', dto.tag);
            expect(response.body).toHaveProperty('avatarKey', dto.avatarKey);
            expect(response.headers['set-cookie']).toBeDefined();
            expect(response.headers['set-cookie'][0]).toContain(
                'refresh_token',
            );
        }, 999999);

        it('중복 이메일로 회원가입 시도 시 실패', async () => {
            const dto: RegisterRequest = {
                email: 'test@test.com',
                nickname: 'test',
                tag: generateTag(),
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            // 첫 번째 회원가입
            await request(app.getHttpServer())
                .post('/auth/register')
                .send(dto)
                .expect(201);

            // 중복 이메일로 두 번째 회원가입 시도
            const duplicateDto: RegisterRequest = {
                ...dto,
                nickname: randomString('nick2'),
                tag: generateTag(),
            };

            await request(app.getHttpServer())
                .post('/auth/register')
                .send(duplicateDto)
                .expect(409);
        });

        it('중복 태그로 회원가입 시도 시 실패', async () => {
            const tag = generateTag();
            const dto1: RegisterRequest = {
                email: `${randomString('user1')}@test.com`,
                nickname: randomString('nick1'),
                tag,
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            // 첫 번째 회원가입
            await request(app.getHttpServer())
                .post('/auth/register')
                .send(dto1)
                .expect(201);

            // 중복 태그로 두 번째 회원가입 시도
            const duplicateDto: RegisterRequest = {
                email: `${randomString('user2')}@test.com`,
                nickname: randomString('nick2'),
                tag,
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            await request(app.getHttpServer())
                .post('/auth/register')
                .send(duplicateDto)
                .expect(409);
        });

        it('잘못된 이메일 형식으로 회원가입 시도 시 실패', async () => {
            const dto: RegisterRequest = {
                email: 'invalid-email',
                nickname: randomString('nick'),
                tag: generateTag(),
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            await request(app.getHttpServer())
                .post('/auth/register')
                .send(dto)
                .expect(400);
        });

        it('잘못된 닉네임 길이로 회원가입 시도 시 실패', async () => {
            const dto: RegisterRequest = {
                email: `${randomString('user')}@test.com`,
                nickname: 'a', // 2자 미만
                tag: generateTag(),
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            await request(app.getHttpServer())
                .post('/auth/register')
                .send(dto)
                .expect(400);
        });

        it('잘못된 태그 형식으로 회원가입 시도 시 실패', async () => {
            const dto: RegisterRequest = {
                email: `${randomString('user')}@test.com`,
                nickname: randomString('nick'),
                tag: 'INVALID_TAG', // 대문자 포함
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            await request(app.getHttpServer())
                .post('/auth/register')
                .send(dto)
                .expect(400);
        });

        it('잘못된 provider로 회원가입 시도 시 실패', async () => {
            const dto = {
                email: `${randomString('user')}@test.com`,
                nickname: randomString('nick'),
                tag: generateTag(),
                provider: 'INVALID_PROVIDER',
                avatarKey: 'pawn',
            };

            await request(app.getHttpServer())
                .post('/auth/register')
                .send(dto)
                .expect(400);
        });
    });

    describe('POST /auth/:provider/login', () => {
        it('등록된 사용자로 로그인 성공', async () => {
            // 먼저 회원가입
            const registerDto: RegisterRequest = {
                email: `${randomString('user')}@test.com`,
                nickname: randomString('nick'),
                tag: generateTag(),
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            await request(app.getHttpServer())
                .post('/auth/register')
                .send(registerDto)
                .expect(201);

            // oauth 회원 정보 가져오는 부분 mocking
            jest.spyOn(oauthContext, 'getUserInfo').mockResolvedValue({
                email: registerDto.email,
                name: registerDto.nickname,
                provider: registerDto.provider,
            });

            // 로그인 시도
            const loginDto: LoginRequest = {
                accessToken: 'mock-google-token',
            };

            const response = await request(app.getHttpServer())
                .post('/auth/GOOGLE/login')
                .send(loginDto)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('email', registerDto.email);
            expect(response.body).toHaveProperty(
                'nickname',
                registerDto.nickname,
            );
            expect(response.body).toHaveProperty('tag', registerDto.tag);
            expect(response.body).toHaveProperty(
                'avatarKey',
                registerDto.avatarKey,
            );
            expect(response.headers['set-cookie']).toBeDefined();
            expect(response.headers['set-cookie'][0]).toContain(
                'refresh_token',
            );
        });

        it('등록되지 않은 사용자로 로그인 시도 시 실패', async () => {
            const loginDto: LoginRequest = {
                accessToken: 'mock-google-token',
            };

            await request(app.getHttpServer())
                .post('/auth/GOOGLE/login')
                .send(loginDto)
                .expect(404);
        });

        it('accessToken 없이 로그인 시도 시 실패', async () => {
            await request(app.getHttpServer())
                .post('/auth/GOOGLE/login')
                .send({})
                .expect(400);
        });
    });

    describe('POST /auth/token', () => {
        it('유효한 refresh token으로 토큰 갱신 성공', async () => {
            // 회원가입
            const registerDto: RegisterRequest = {
                email: `${randomString('user')}@test.com`,
                nickname: randomString('nick'),
                tag: generateTag(),
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            const agent = request.agent(app.getHttpServer());
            const sessionId = v4();

            const registerResponse = (await agent
                .post('/auth/register')
                .send(registerDto)
                .set('Cookie', `sessionId=${sessionId}`)
                .expect(201)) as ResponseResult<RegisterResponse>;
            const { accessToken } = registerResponse.body;

            // 토큰 갱신
            const response = await agent
                .post('/auth/token')
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Cookie', `sessionId=${sessionId}`)
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.headers['set-cookie']).toBeDefined();
            expect(response.headers['set-cookie'][0]).toContain(
                'refresh_token',
            );
        });

        it('유효하지 않은 refresh token으로 갱신 시도 시 실패', async () => {
            await request(app.getHttpServer())
                .post('/auth/token')
                .set('Cookie', 'refresh_token=invalid-token')
                .expect(401);
        });

        it('refresh token 없이 갱신 시도 시 실패', async () => {
            await request(app.getHttpServer()).post('/auth/token').expect(401);
        });

        it('다른 브라우저에서 갱신 시도 시 실패', async () => {
            // 회원가입
            const registerDto: RegisterRequest = {
                email: `${randomString('user')}@test.com`,
                nickname: randomString('nick'),
                tag: generateTag(),
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            const agent = request.agent(app.getHttpServer());
            const sessionId = v4();

            await agent
                .post('/auth/register')
                .send(registerDto)
                .set('Cookie', `sessionId=${sessionId}`)
                .set(
                    'User-Agent',
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36',
                )
                .expect(201);

            // 다른 브라우저에서 토큰 갱신 시도
            await agent
                .post('/auth/token')
                .set('Cookie', `sessionId=${sessionId}`)
                .set(
                    'User-Agent',
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Firefox/89.0',
                )
                .expect(401);
        });

        it('ip는 달라져도 재발급에 영향을 주지 않는다', async () => {
            // 회원가입
            const registerDto: RegisterRequest = {
                email: `${randomString('user')}@test.com`,
                nickname: randomString('nick'),
                tag: generateTag(),
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            const agent = request.agent(app.getHttpServer());
            const sessionId = v4();

            await agent
                .post('/auth/register')
                .send(registerDto)
                .set('Cookie', `sessionId=${sessionId}`)
                .set('X-Forwarded-For', '192.168.1.100')
                .expect(201);

            // 다른 IP에서 토큰 갱신 시도
            await agent
                .post('/auth/token')
                .set('Cookie', `sessionId=${sessionId}`)
                .set('X-Forwarded-For', '192.168.1.200')
                .expect(200);
        });

        it('다른 세션에서 갱신 시도 시 실패', async () => {
            // 회원가입
            const registerDto: RegisterRequest = {
                email: `${randomString('user')}@test.com`,
                nickname: randomString('nick'),
                tag: generateTag(),
                provider: 'GOOGLE',
                avatarKey: 'pawn',
            };

            const agent = request.agent(app.getHttpServer());
            const sessionId = v4();
            const otherSessionId = v4();

            await agent
                .post('/auth/register')
                .send(registerDto)
                .set('Cookie', `sessionId=${sessionId}`)
                .expect(201);

            // 다른 세션에서 토큰 갱신 시도
            await agent
                .post('/auth/token')
                .set('Cookie', `sessionId=${otherSessionId}`)
                .expect(401);
        });

        it('잘못된 형식의 refresh token으로 갱신 시도 시 실패', async () => {
            await request(app.getHttpServer())
                .post('/auth/token')
                .set('Cookie', 'refresh_token=invalid.jwt.format')
                .expect(401);
        });
    });

    describe('DELETE /auth/logout', () => {
        it('로그아웃 성공', async () => {
            const sessionId = v4();
            const agent = request.agent(app.getHttpServer());

            const registerResponse = (await agent
                .post('/auth/register')
                .send({
                    email: 'test@test.com',
                    nickname: 'test',
                    tag: 'test',
                    provider: 'GOOGLE',
                    avatarKey: 'pawn',
                })
                .set('Cookie', `sessionId=${sessionId}`)
                .expect(201)) as ResponseResult<RegisterResponse>;

            const { accessToken } = registerResponse.body;

            await agent
                .delete('/auth/logout')
                .set('Cookie', `sessionId=${sessionId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(204);

            const deletedToken = await prisma.refreshToken.findMany({
                where: { expiredAt: null },
            });

            expect(deletedToken).toHaveLength(0);
            expect(deletedToken.length).toBe(0);
        });
    });
});
