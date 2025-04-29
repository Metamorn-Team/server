import { Test, TestingModule } from '@nestjs/testing';
import { IslandService } from 'src/domain/services/islands/island.service';
import { IslandTypeEnum } from 'src/domain/types/island.types';
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
            const type = IslandTypeEnum.UNINHABITED;

            await islandService.create(type);
            const island = await db.island.findFirst({ where: { type } });

            expect(island?.id).toBeTruthy();
            expect(island?.type).toEqual(type);
            expect(island?.createdAt).toBeTruthy();
            expect(island?.updatedAt).toBeTruthy();
            expect(island?.deletedAt).toBeNull();
        });
    });
});
