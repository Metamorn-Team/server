/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as request from 'supertest';

import { HttpStatus, INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { login } from 'test/helper/login';
import { ChangeNicknameRequest } from 'src/presentation/dto/users/request/change-nickname.request';
import { ChangeTagRequest } from 'src/presentation/dto/users/request/change-tag.request';
import { generateFriendship, generateUserEntity } from 'test/helper/generators';
import { v4 } from 'uuid';
import { SearchUserResponse } from 'src/presentation/dto/users/response/search-users.response';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { ResponseResult } from 'test/helper/types';
import { ChangeAvatarRequest } from 'src/presentation/dto/users/request/change-avatar.request';
import { FriendRequestStatus } from '@prisma/client';
import { GetUserResponse, SearchUsersRequest } from 'src/presentation/dto';

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
        await prisma.friendRequest.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('(GET) /users/:id', () => {
        it('유저 정보 조회 정상 동작', async () => {
            const { accessToken } = await login(app);

            const user = await prisma.user.create({
                data: generateUserEntity('test@email.com', 'test', '11111'),
            });

            const response = await request(app.getHttpServer())
                .get(`/users/${user.id}`)
                .set('Authorization', accessToken);

            const { status } = response;

            expect(status).toEqual(200);
            expect(response.body).toHaveProperty('email', user.email);
            expect(response.body).toHaveProperty('nickname', user.nickname);
            expect(response.body).toHaveProperty('tag', user.tag);
        });

        it('친구 관계인 유저 정보 조회 시 friendStatus가 "ACCEPTED"여야 한다', async () => {
            const currentUser = await login(app);
            const targetUser = await prisma.user.create({
                data: generateUserEntity(
                    'target@email.com',
                    'targetUser',
                    'tagTarget',
                ),
            });

            await prisma.friendRequest.create({
                data: generateFriendship(currentUser.userId, targetUser.id, {
                    status: FriendRequestStatus.ACCEPTED,
                }),
            });

            const response = (await request(app.getHttpServer())
                .get(`/users/${targetUser.id}`)
                .set(
                    'Authorization',
                    currentUser.accessToken,
                )) as ResponseResult<GetUserResponse>;

            const { status, body } = response;

            expect(status).toEqual(HttpStatus.OK);
            expect(body).toHaveProperty('id', targetUser.id);
            expect(body).toHaveProperty('friendStatus', 'ACCEPTED');
        });

        it('친구 관계가 아닌 유저 정보 조회 시 friendStatus가 null이어야 한다', async () => {
            const currentUser = await login(app);
            const nonFriendUser = await prisma.user.create({
                data: generateUserEntity(
                    'nonfriend@email.com',
                    'nonFriend',
                    'tagNonFriend',
                ),
            });

            const response = (await request(app.getHttpServer())
                .get(`/users/${nonFriendUser.id}`)
                .set(
                    'Authorization',
                    currentUser.accessToken,
                )) as ResponseResult<GetUserResponse>;

            const { status, body } = response;

            expect(status).toEqual(HttpStatus.OK);
            expect(body).toHaveProperty('id', nonFriendUser.id);
            expect(body).toHaveProperty('friendStatus', null);
        });

        it('자신의 프로필 정보 조회 시 400 에러 코드 응답', async () => {
            const currentUser = await login(app);
            const response = await request(app.getHttpServer())
                .get(`/users/${currentUser.userId}`)
                .set('Authorization', currentUser.accessToken);

            const { status } = response;

            expect(status).toEqual(HttpStatus.BAD_REQUEST);
        });

        it('유저 검색 유저ID 에러 동작', async () => {
            const { accessToken } = await login(app);

            const wrongUserId = v4();

            const response = await request(app.getHttpServer())
                .get(`/users/${wrongUserId}`)
                .set('Authorization', accessToken);

            const { status } = response;

            expect(status).toEqual(404);
        });
    });

    describe('(PATCH) /users/nickname - 닉네임 변경', () => {
        it('닉네임 변경 정상 동작', async () => {
            const { accessToken } = await login(app);

            const dto: ChangeNicknameRequest = {
                nickname: 'new_nickname',
            };

            const response = await request(app.getHttpServer())
                .patch('/users/nickname')
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

    describe('(PATCH) /users/tag - 태그 변경', () => {
        it('태그 변경 정상 동작', async () => {
            const { accessToken } = await login(app);

            const dto: ChangeTagRequest = {
                tag: 'new_tag',
            };

            const response = await request(app.getHttpServer())
                .patch('/users/tag')
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
            const { accessToken } = await login(app);

            const dto: ChangeTagRequest = {
                tag: 'metamorn',
            };

            const response = await request(app.getHttpServer())
                .patch('/users/tag')
                .send(dto)
                .set('Authorization', accessToken);
            const { status } = response;

            expect(status).toEqual(409);
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
                .patch('/users/tag')
                .send(dto)
                .set('Authorization', accessToken);
            const { status } = response;

            expect(status).toEqual(409);
        });
    });

    describe('(PATCH) /users/avatar - 아바타 변경', () => {
        it('아바타 변경 정상 동작', async () => {
            const { accessToken } = await login(app);

            const dto: ChangeAvatarRequest = {
                avatarKey: 'red_pawn',
            };

            const response = await request(app.getHttpServer())
                .patch('/users/avatar')
                .send(dto)
                .set('Authorization', accessToken);
            const { status } = response;
            const updatedUser = await prisma.user.findFirst({
                where: {
                    avatarKey: 'red_pawn',
                },
            });

            expect(status).toEqual(204);
            expect(updatedUser).not.toBeNull();
        });
    });

    describe('(GET) /users/search - 유저 검색', () => {
        const totalUsers = 20;

        beforeEach(async () => {
            await prisma.user.deleteMany();

            const usersToCreate: UserEntity[] = Array.from(
                { length: totalUsers },
                (_, i) => {
                    const currentIndex = i + 1;
                    const nicknamePrefix =
                        currentIndex <= 10 ? 'searchTarget' : 'another';
                    const tagPrefix =
                        currentIndex % 2 === 0 ? 'evenTag' : 'oddTag';
                    return generateUserEntity(
                        `user${currentIndex}@test.com`,
                        `${nicknamePrefix}User${String(currentIndex).padStart(2, '0')}`,
                        `${tagPrefix}${String(currentIndex).padStart(2, '0')}`,
                    );
                },
            );

            await prisma.user.createMany({
                data: usersToCreate,
                skipDuplicates: true,
            });
        });

        it('닉네임으로 검색 (부분 일치)', async () => {
            const { accessToken } = await login(app);

            const limit = 5;

            const query: SearchUsersRequest = {
                search: 'searchTarget',
                varient: 'NICKNAME',
                limit: limit,
            };
            const response = (await request(app.getHttpServer())
                .get('/users/search')
                .query(query)
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<SearchUserResponse>;

            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.data).toHaveLength(limit);
            expect(body.data[0].nickname).toEqual('searchTargetUser01');
            expect(body.nextCursor).not.toBeNull();
        });

        it('태그로 검색 (부분 일치, 첫 페이지)', async () => {
            const { accessToken } = await login(app);

            const limit = 3;
            const query: SearchUsersRequest = {
                search: 'evenTag',
                varient: 'TAG',
                limit,
            };
            const response = (await request(app.getHttpServer())
                .get('/users/search')
                .set('Authorization', accessToken)
                .query(query)
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<SearchUserResponse>;
            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.data).toHaveLength(limit);
            expect(body.data[0].tag).toEqual('evenTag02');
            expect(body.nextCursor).not.toBeNull();
        });

        it('검색 결과가 없는 경우', async () => {
            const { accessToken } = await login(app);

            const query: SearchUsersRequest = {
                search: 'nonExistent',
                varient: 'NICKNAME',
            };
            const response = (await request(app.getHttpServer())
                .get('/users/search')
                .query(query)
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<SearchUserResponse>;
            const { status, body } = response;

            expect(status).toEqual(200);
            expect(body.data).toHaveLength(0);
            expect(body.nextCursor).toBeNull();
        });

        it('페이지네이션 (limit, cursor) - 닉네임 검색', async () => {
            const { accessToken } = await login(app);

            const limit = 4;
            const searchTerm = 'searchTarget';
            const expectedTotal = 10;
            let fetchedUsersCount = 0;
            let nextCursor: string | null = null;

            for (let page = 0; ; page++) {
                const queryParams: SearchUsersRequest & { cursor?: string } = {
                    search: searchTerm,
                    varient: 'NICKNAME',
                    limit,
                };
                if (nextCursor) {
                    queryParams.cursor = nextCursor;
                }

                const response = (await request(app.getHttpServer())
                    .get('/users/search')
                    .query(queryParams)
                    .set(
                        'Authorization',
                        accessToken,
                    )) as ResponseResult<SearchUserResponse>;
                const { status, body } = response;

                expect(status).toEqual(200);

                fetchedUsersCount += body.data.length;

                if (body.data.length > 0) {
                    const expectedFirstNickname = `${searchTerm}User${String(page * limit + 1).padStart(2, '0')}`;
                    expect(body.data[0].nickname).toEqual(
                        expectedFirstNickname,
                    );
                }

                if (body.nextCursor) {
                    nextCursor = body.nextCursor;
                } else {
                    expect(body.nextCursor).toBeNull();
                    break;
                }
                if (page > Math.ceil(expectedTotal / limit)) {
                    throw new Error(
                        'Pagination test exceeded expected page count.',
                    );
                }
            }
            expect(fetchedUsersCount).toEqual(expectedTotal);
        });

        it('필수 파라미터(search) 누락 시 400 에러', async () => {
            const { accessToken } = await login(app);

            const response = await request(app.getHttpServer())
                .get('/users/search')
                .query({ varient: 'NICKNAME' })
                .set('Authorization', accessToken);
            expect(response.status).toEqual(400);
        });
        it('필수 파라미터(varient) 누락 시 400 에러', async () => {
            const { accessToken } = await login(app);

            const response = await request(app.getHttpServer())
                .get('/users/search')
                .query({ search: 'test' })
                .set('Authorization', accessToken);
            expect(response.status).toEqual(400);
        });
        it('잘못된 varient 값 입력 시 400 에러', async () => {
            const { accessToken } = await login(app);

            const response = await request(app.getHttpServer())
                .get('/users/search')
                .query({ search: 'test', varient: 'INVALID_VARIENT' })
                .set('Authorization', accessToken);
            expect(response.status).toEqual(400);
        });
        it('limit에 숫자가 아닌 값 입력 시 400 에러', async () => {
            const { accessToken } = await login(app);

            const response = await request(app.getHttpServer())
                .get('/users/search')
                .query({
                    search: 'test',
                    varient: 'NICKNAME',
                    limit: 'abc',
                })
                .set('Authorization', accessToken);
            expect(response.status).toEqual(400);
        });
        it('limit에 1 미만의 값 입력 시 400 에러', async () => {
            const { accessToken } = await login(app);

            const response = await request(app.getHttpServer())
                .get('/users/search')
                .query({ search: 'test', varient: 'NICKNAME', limit: 0 })
                .set('Authorization', accessToken);
            expect(response.status).toEqual(400);
        });
        it('검색어가 최소 길이(2) 미만일 경우 400 에러를 반환한다 (빈 문자열)', async () => {
            const { accessToken } = await login(app);

            const response = await request(app.getHttpServer())
                .get('/users/search')
                .query({
                    search: '',
                    varient: 'NICKNAME',
                })
                .set('Authorization', accessToken);

            expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        });

        it('로그인된 사용자를 검색 결과에서 제외한다', async () => {
            const {
                userId: currentUserId,
                accessToken,
                nickname: currentUserNickname,
            } = await login(app);

            const otherUserNickname = '메타버스';
            const otherUser = await prisma.user.create({
                data: generateUserEntity(
                    'other@test.com',
                    otherUserNickname,
                    'othertag',
                ),
            });

            const searchTerm = '메타';
            const response = (await request(app.getHttpServer())
                .get('/users/search')
                .query({
                    search: searchTerm,
                    varient: 'NICKNAME',
                })
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<SearchUserResponse>;

            const { status, body } = response;

            expect(status).toEqual(HttpStatus.OK);
            expect(Array.isArray(body.data)).toBe(true);

            const foundOtherUser = body.data.find(
                (user) => user.id === otherUser.id,
            );
            expect(foundOtherUser).toBeDefined();
            expect(foundOtherUser?.nickname).toEqual(otherUserNickname);

            const foundCurrentUser = body.data.find(
                (user) => user.id === currentUserId,
            );
            expect(foundCurrentUser).toBeUndefined();

            expect(currentUserNickname.startsWith(searchTerm)).toBe(true);
        });
    });
});
