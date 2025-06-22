import { Injectable } from '@nestjs/common';
import { SpawnZoneRepository } from 'src/domain/interface/spawn-zone.repository';
import { SpawnZone } from 'src/domain/types/spawn-zone';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class SpawnZonePrismaRepository implements SpawnZoneRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByMapId(mapId: string): Promise<SpawnZone[]> {
        return this.prisma.spawnZone.findMany({
            select: {
                id: true,
                mapId: true,
                gridX: true,
                gridY: true,
                spawnObject: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        respawnTime: true,
                        maxHp: true,
                    },
                },
            },
            where: { mapId },
        });
    }
}
