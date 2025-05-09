import { Inject, Injectable } from '@nestjs/common';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';

@Injectable()
export class NormalIslandStorageReader {
    constructor(
        @Inject(NormalIslandStorage)
        private readonly normalIslandStorage: NormalIslandStorage,
    ) {}

    async readOne(islandId: string) {
        return await this.normalIslandStorage.getIsland(islandId);
    }

    async readIslands(page: number, limit = 20, tag?: string | null) {
        let allIslands = await this.normalIslandStorage.getAllIsland();

        if (tag) {
            allIslands = allIslands.filter((island) =>
                island.tags.includes(tag),
            );
        }

        allIslands.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );

        const start = (page - 1) * limit;
        const end = start + limit;

        const islands = allIslands.slice(start, end).map((island) => ({
            id: island.id,
            maxMembers: island.max,
            countParticipants: island.players.size,
            name: island.name,
            description: island.description,
            coverImage: island.coverImage,
            tags: island.tags,
        }));
        const count = allIslands.length;

        return {
            islands,
            count,
        };
    }

    async countPlayerByIsland(islandId: string) {
        return await this.normalIslandStorage.countPlayer(islandId);
    }

    async getAllPlayer(islandId: string) {
        return await this.normalIslandStorage.getPlayerIdsByIslandId(islandId);
    }

    // logging
    // getStore() {
    //     return this.normalIslandStorage.getIslandStore();
    // }
}
