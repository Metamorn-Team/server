import { Inject, Injectable } from '@nestjs/common';
import { LivePrivateIslandStorage } from 'src/domain/interface/storages/live-private-island-storage';
import { CreateLivePrivateIsland } from 'src/domain/types/private-island.types';

@Injectable()
export class LivePrivateIslandWriter {
    constructor(
        @Inject(LivePrivateIslandStorage)
        private readonly privateIslandStorage: LivePrivateIslandStorage,
    ) {}

    async create(island: CreateLivePrivateIsland): Promise<void> {
        await this.privateIslandStorage.create(island);
    }

    async addPlayer(islandId: string, playerId: string): Promise<void> {
        await this.privateIslandStorage.addPlayer(islandId, playerId);
    }

    async removePlayer(islandId: string, playerId: string): Promise<void> {
        await this.privateIslandStorage.removePlayer(islandId, playerId);
    }

    async remove(islandId: string): Promise<void> {
        await this.privateIslandStorage.delete(islandId);
    }
}
