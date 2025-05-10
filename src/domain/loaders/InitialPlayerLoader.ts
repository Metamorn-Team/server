import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';

@Injectable()
export class InitialPlayerLoader implements OnModuleInit {
    constructor(
        @Inject(PlayerStorage)
        private readonly playerStorage: PlayerStorage,
        private readonly playerMemoryStorage: PlayerMemoryStorage,
    ) {}

    async onModuleInit() {
        const players = await this.playerStorage.getAllPlayers();

        players.forEach((player) => this.playerMemoryStorage.addPlayer(player));
    }
}
