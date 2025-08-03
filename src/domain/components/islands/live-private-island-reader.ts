import { Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { LivePrivateIslandStorage } from 'src/domain/interface/storages/live-private-island-storage';

@Injectable()
export class LivePrivateIslandReader {
    constructor(
        @Inject(LivePrivateIslandStorage)
        private readonly livePrivateIslandStorage: LivePrivateIslandStorage,
    ) {}

    async readOne(id: string) {
        const island = await this.livePrivateIslandStorage.get(id);
        if (!island) {
            throw new DomainException(
                DomainExceptionType.ISLAND_NOT_FOUND_IN_STORAGE,
            );
        }

        return island;
    }

    async isLive(id: string): Promise<boolean> {
        return !!(await this.livePrivateIslandStorage.get(id));
    }

    async getIslandsLiveStatus(
        ids: string[],
    ): Promise<Record<string, boolean>> {
        const result: Record<string, boolean> = {};

        // NOTE pipeline으로 묶기
        for (const id of ids) {
            const isLive = !!(await this.livePrivateIslandStorage.get(id));
            result[id] = isLive;
        }

        return result;
    }
}
