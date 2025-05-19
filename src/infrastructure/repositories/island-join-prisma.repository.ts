import { Injectable } from '@nestjs/common';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { IslandJoinRepository } from 'src/domain/interface/island-join.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class IslandJoinPrismaRepository implements IslandJoinRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(data: IslandJoinEntity): Promise<void> {
        await this.prisma.islandJoin.create({ data });
    }

    /**
     * 현재 업데이트 가능한 데이터가 leftAt 뿐이라 이렇게 구현함.
     * 데이터 추가될 시 leftAt을 Parital<IslandJoinEntity>로 변경.
     */
    async update(
        userId: string,
        islandId: string,
        leftAt: Date,
    ): Promise<void> {
        await this.prisma.islandJoin.updateMany({
            data: { leftAt },
            where: {
                userId,
                islandId,
                leftAt: null,
            },
        });
    }
}
