import { Injectable } from '@nestjs/common';
import { DesertedIslandManager } from 'src/domain/components/islands/deserted-storage/deserted-island-manager';
import { IslandManager } from 'src/domain/components/islands/interface/island-manager';
import { NormalIslandManager } from 'src/domain/components/islands/normal-storage/normal-island-manager';
import { PrivateIslandManager } from 'src/domain/components/islands/private-storage/private-island-manager';
import { IslandTypeEnum } from 'src/domain/types/island.types';

@Injectable()
export class IslandManagerFactory {
    constructor(
        private readonly normalIslandManager: NormalIslandManager,
        private readonly desertedIslandManager: DesertedIslandManager,
        private readonly privateIslandManager: PrivateIslandManager,
    ) {}

    get(type: IslandTypeEnum): IslandManager {
        switch (type) {
            case IslandTypeEnum.NORMAL:
                return this.normalIslandManager;
            case IslandTypeEnum.DESERTED:
                return this.desertedIslandManager;
            case IslandTypeEnum.PRIVATE:
                return this.privateIslandManager;
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

    getPrivateIslandManager(): PrivateIslandManager {
        return this.privateIslandManager;
    }
}
