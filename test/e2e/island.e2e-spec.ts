import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helper/login';
import { CreateIslandRequest } from 'src/presentation/dto/island/create-island.request';

describe('IslandController (e2e)', () => {
    let app: INestApplication;
    let db: PrismaService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        db = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();
    });

    afterEach(async () => {
        await db.island.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(() => {
        void app.close();
    });

    describe('GET /islands - 섬 생성', () => {
        it('섬 생성 정상 동작', async () => {
            const { accessToken } = await login(app);

            const dto: CreateIslandRequest = {
                coverImage: 'https://island-image.com',
                description: '멋진 섬입니다.',
                maxMembers: 5,
                name: '멋진 섬',
            };

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const response = await request(app.getHttpServer())
                .post('/islands')
                .send(dto)
                .set('Authorization', accessToken);
            const { status } = response;
            const island = await db.island.findMany();

            expect(status).toEqual(201);
            expect(island.length).toEqual(1);
        });
    });
});
