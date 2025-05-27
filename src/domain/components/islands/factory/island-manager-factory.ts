import { Injectable } from '@nestjs/common';
import { DesertedIslandManager } from 'src/domain/components/islands/deserted-storage/deserted-island-manager';
import { IslandManager } from 'src/domain/components/islands/interface/island-manager';
import { NormalIslandManager } from 'src/domain/components/islands/normal-storage/normal-island-manager';
import { IslandTypeEnum } from 'src/domain/types/island.types';

@Injectable()
export class IslandManagerFactory {
    constructor(
        private readonly normalIslandManager: NormalIslandManager,
        private readonly desertedIslandManager: DesertedIslandManager,
    ) {}

    get(type: IslandTypeEnum): IslandManager {
        switch (type) {
            case IslandTypeEnum.NORMAL:
                return this.normalIslandManager;
            case IslandTypeEnum.DESERTED:
                return this.desertedIslandManager;
            default:
                throw new Error('Invalid island type');
        }
    }

    getNormalIslandManager(): NormalIslandManager {
        return this.normalIslandManager;
    }

    getDesertedIslandManager(): DesertedIslandManager {
        return this.desertedIslandManager;
    }
}
