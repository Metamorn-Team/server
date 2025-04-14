import { Test, TestingModule } from '@nestjs/testing';
import { IslandService } from 'src/domain/services/islands/island.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { IslandModule } from 'src/modules/islands/island.module';

describe('IslandService', () => {
    let islandService: IslandService;
    let db: PrismaService;

    beforeAll(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [IslandModule, PrismaModule],
        }).compile();

        islandService = app.get<IslandService>(IslandService);
        db = app.get<PrismaService>(PrismaService);
    });

    afterEach(async () => {
        await db.island.deleteMany();
    });

    describe('섬 생성', () => {
        it('섬 생성 정상 동작', async () => {
            const tag = 'dev';

            await islandService.create(tag);
            const island = await db.island.findFirst({ where: { tag } });

            expect(island?.id).toBeTruthy();
            expect(island?.tag).toEqual(tag);
            expect(island?.createdAt).toBeTruthy();
            expect(island?.updatedAt).toBeTruthy();
            expect(island?.deletedAt).toBeNull();
        });
    });
});
