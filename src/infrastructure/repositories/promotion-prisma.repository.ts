import { Injectable } from '@nestjs/common';
import { PromotionRepository } from 'src/domain/interface/promotion.repository';
import {
    convertNumberToPromotionType,
    Promotion,
} from 'src/domain/types/promotion.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PromotionPrismaRepository implements PromotionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(now: Date): Promise<Promotion[]> {
        const result = await this.prisma.promotion.findMany({
            where: {
                startedAt: {
                    lte: now,
                },
                endedAt: {
                    gt: now,
                },
            },
        });

        return result.map((row) => ({
            ...row,
            type: convertNumberToPromotionType(row.type),
        }));
    }
}
