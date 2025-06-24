import { Injectable } from '@nestjs/common';
import { PlayerSpawnPointRepository } from 'src/domain/interface/player-spawn-point.repository';
import { PlayerSpawnPoint } from 'src/domain/types/player-spawn-point.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PlayerSpawnPointPrismaRepository
    implements PlayerSpawnPointRepository
{
    constructor(private readonly prisma: PrismaService) {}

    async findAll(mapId: string): Promise<PlayerSpawnPoint[]> {
        return await this.prisma.playerSpawnPoint.findMany({
            where: {
                mapId,
            },
            select: {
                id: true,
                mapId: true,
                x: true,
                y: true,
            },
        });
    }

    async findAllByKey(mapKey: string): Promise<PlayerSpawnPoint[]> {
        return await this.prisma.playerSpawnPoint.findMany({
            where: {
                map: {
                    key: mapKey,
                },
            },
            select: {
                id: true,
                mapId: true,
                x: true,
                y: true,
            },
        });
    }
}
