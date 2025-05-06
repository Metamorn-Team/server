import { Inject, Injectable } from '@nestjs/common';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';

@Injectable()
export class NormalIslandStorageReader {
    constructor(
        @Inject(NormalIslandStorage)
        private readonly normalIslandStorage: NormalIslandStorage,
    ) {}

    readOne(islandId: string) {
        return this.normalIslandStorage.getIsland(islandId);
    }

    readIslands(page: number, limit = 20) {
        const islands = this.normalIslandStorage.getAllIsland();

        islands.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const start = (page - 1) * limit;
        const end = start + limit;

        return islands.slice(start, end).map((island) => ({
            id: island.id,
            maxMembers: island.max,
            countParticipants: island.players.size,
            name: island.name,
            description: island.description,
            coverImage: island.coverImage,
            tags: island.tags,
        }));
    }

    countPlayerByIsland(islandId: string) {
        return this.normalIslandStorage.countPlayer(islandId);
    }

    addPlayer(islandId: string, playerId: string) {
        this.normalIslandStorage.addPlayerToIsland(islandId, playerId);
    }

    getAllPlayer(islandId: string) {
        return this.normalIslandStorage.getPlayerIdsByIslandId(islandId);
    }

    // logging
    getStore() {
        return this.normalIslandStorage.getIslandStore();
    }
}
