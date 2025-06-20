import { Module } from '@nestjs/common';
import { PlayerSpawnPointReader } from 'src/domain/components/player-spawn-point/player-spawn-point-reader';
import { PlayerSpawnPointRepository } from 'src/domain/interface/player-spawn-point.repository';
import { PlayerSpawnPointPrismaRepository } from 'src/infrastructure/repositories/player-spawn-point-prisame.repository';

@Module({
    providers: [
        PlayerSpawnPointReader,
        {
            provide: PlayerSpawnPointRepository,
            useClass: PlayerSpawnPointPrismaRepository,
        },
    ],
    exports: [PlayerSpawnPointReader],
})
export class PlayerSpawnPointComponentModule {}
