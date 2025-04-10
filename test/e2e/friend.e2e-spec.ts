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
    GetFriendRequestsResponseDto,
} from 'src/presentation/dto/friends';

describe('FriendController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let loggedInUser: {
        userId: string;
        accessToken: string;
        nickname: string;
        tag: string;
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();

        loggedInUser = await login(app);
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: 'metamorn@metamorn.com' },
        });
        app.close();
    });

    afterEach(async () => {
        await prisma.friendRequest.deleteMany();
        await prisma.user.deleteMany({
            where: { email: { not: 'metamorn@metamorn.com' } },
        });
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

            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    /***********************************************************/
    //!(친구요청 목록 조회) ai로 테스트 코드 작성 검증 필요
    /***********************************************************/

    describe('GET /friends/requests - 친구 요청 목록 조회 (정상 동작)', () => {
        let userB: any; // 테스트용 유저 B
        let userC: any; // 테스트용 유저 C
        let requestBtoA: any; // B -> A(로그인 유저) 요청
        let requestAtoC: any; // A(로그인 유저) -> C 요청

        // 각 'it' 테스트 실행 전에 필요한 유저와 친구 요청 데이터를 생성하는 헬퍼 함수
        const setupTestData = async () => {
            userB = await prisma.user.create({
                data: generateUserEntity('userB@test.com', 'UserB', 'tagB'),
            });
            userC = await prisma.user.create({
                data: generateUserEntity('userC@test.com', 'UserC', 'tagC'),
            });

            // B가 로그인한 유저(A)에게 보낸 요청 생성
            requestBtoA = await prisma.friendRequest.create({
                data: {
                    id: v4(),
                    senderId: userB.id,
                    receiverId: loggedInUser.userId,
                    status: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            // 로그인한 유저(A)가 C에게 보낸 요청 생성
            requestAtoC = await prisma.friendRequest.create({
                data: {
                    id: v4(),
                    senderId: loggedInUser.userId,
                    receiverId: userC.id,
                    status: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        };

        it('받은 친구 요청 목록을 정상적으로 조회한다', async () => {
            await setupTestData(); // 테스트 데이터 생성

            // API 호출: 받은 요청 목록 조회 (direction=received)
            const response = await request(app.getHttpServer())
                .get('/friends/requests')
                .query({ direction: FriendRequestDirection.RECEIVED }) // 받은 요청 명시
                .set('Authorization', loggedInUser.accessToken) // 로그인 토큰 설정
                .expect(HttpStatus.OK); // 200 OK 상태 코드 기대

            // 응답 본문 검증
            const body = response.body as GetFriendRequestsResponseDto;
            expect(body.data).toHaveLength(1); // B -> A 요청 1개 확인
            expect(body.data[0].id).toBe(requestBtoA.id); // 요청 ID 확인
            expect(body.data[0].user.id).toBe(userB.id); // 보낸 사람(UserB) ID 확인
            expect(body.data[0].user.nickname).toBe(userB.nickname); // 보낸 사람 닉네임 확인
            expect(body.data[0].user.tag).toBe(userB.tag); // 보낸 사람 태그 확인
            expect(body.nextCursor).toBeNull(); // 다음 페이지 없으므로 커서는 null
        });

        it('보낸 친구 요청 목록을 정상적으로 조회한다', async () => {
            await setupTestData(); // 테스트 데이터 생성

            // API 호출: 보낸 요청 목록 조회 (direction=sent)
            const response = await request(app.getHttpServer())
                .get('/friends/requests')
                .query({ direction: FriendRequestDirection.SENT }) // 보낸 요청 명시
                .set('Authorization', loggedInUser.accessToken) // 로그인 토큰 설정
                .expect(HttpStatus.OK); // 200 OK 상태 코드 기대

            // 응답 본문 검증
            const body = response.body as GetFriendRequestsResponseDto;
            expect(body.data).toHaveLength(1); // A -> C 요청 1개 확인
            expect(body.data[0].id).toBe(requestAtoC.id); // 요청 ID 확인
            expect(body.data[0].user.id).toBe(userC.id); // 받은 사람(UserC) ID 확인
            expect(body.data[0].user.nickname).toBe(userC.nickname); // 받은 사람 닉네임 확인
            expect(body.data[0].user.tag).toBe(userC.tag); // 받은 사람 태그 확인
            expect(body.nextCursor).toBeNull(); // 다음 페이지 없으므로 커서는 null
        });

        it('인증 토큰 없이 요청 시 401 Unauthorized 에러를 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/friends/requests')
                .query({ direction: FriendRequestDirection.RECEIVED })
                // .set('Authorization', ...) // 인증 헤더 없음
                .expect(HttpStatus.UNAUTHORIZED); // 401 상태 코드 기대
        });

        it('잘못된 direction 값을 사용하면 400 Bad Request 에러를 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/friends/requests')
                .query({ direction: 'invalid_direction' }) // 유효하지 않은 direction 값
                .set('Authorization', loggedInUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST); // 400 상태 코드 기대
        });

        it('direction 파라미터가 누락되면 400 Bad Request 에러를 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/friends/requests')
                // direction 파라미터 없음
                .set('Authorization', loggedInUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST); // 400 상태 코드 기대
        });

        it('limit 파라미터에 숫자가 아닌 값을 넣으면 400 Bad Request 에러를 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/friends/requests')
                .query({
                    direction: FriendRequestDirection.RECEIVED,
                    limit: 'abc',
                }) // 숫자가 아닌 limit 값
                .set('Authorization', loggedInUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST); // 400 상태 코드 기대
        });

        it('limit 파라미터에 0 이하의 값을 넣으면 400 Bad Request 에러를 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/friends/requests')
                .query({ direction: FriendRequestDirection.RECEIVED, limit: 0 }) // 0 이하의 limit 값
                .set('Authorization', loggedInUser.accessToken)
                .expect(HttpStatus.BAD_REQUEST); // 400 상태 코드 기대
        });

        // 참고: cursor 값 자체의 유효성 검증 (예: UUID 형식)은 DTO나 파이프 단계에서 처리될 수 있으며,
        // 여기서는 주로 쿼리 파라미터 자체의 필수 여부 및 타입/범위 검증에 초점을 맞춥니다.
        // 만약 cursor 값 형식 검증이 중요하다면 해당 케이스도 추가할 수 있습니다.
    });
});
