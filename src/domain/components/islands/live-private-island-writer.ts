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
}
