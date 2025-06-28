import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IslandActiveObjectWriter } from 'src/domain/components/island-spawn-object/island-active-object-writer';
import { SpawnZoneReader } from 'src/domain/components/spawn-zone/spawn-zone-reader';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';

@Injectable()
export class PlayerLoader implements OnModuleInit {
    constructor(
        @Inject(PlayerStorage)
        private readonly playerStorage: PlayerStorage,
        private readonly playerMemoryStorage: PlayerMemoryStorage,
        private readonly islandActiveObjectWriter: IslandActiveObjectWriter,
        private readonly spawnZoneReader: SpawnZoneReader,
    ) {}

    async onModuleInit() {
        if (process.env.NODE_ENV === 'test') return;
        const players = await this.playerStorage.getAllPlayers();
        players.forEach((player) => this.playerMemoryStorage.addPlayer(player));
    }
}
