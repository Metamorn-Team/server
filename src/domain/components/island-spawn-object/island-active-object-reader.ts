import { Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { OBJECT_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { ActiveObject } from 'src/domain/types/spawn-object/active-object';
import { IslandActiveObjectStorage } from 'src/infrastructure/memories/island-active-object-storage';

@Injectable()
export class IslandActiveObjectReader {
    constructor(
        private readonly islandSpawnObjectMemoryStorage: IslandActiveObjectStorage,
    ) {}

    readAll(islandId: string): ActiveObject[] {
        return this.islandSpawnObjectMemoryStorage.readAll(islandId);
    }

    readByIds(islandId: string, ids: string[]): ActiveObject[] {
        return this.islandSpawnObjectMemoryStorage.readByIds(islandId, ids);
    }

    readOne(islandId: string, objectId: string): ActiveObject {
        const object = this.islandSpawnObjectMemoryStorage.readOne(
            islandId,
            objectId,
        );
        if (!object) {
            throw new DomainException(
                DomainExceptionType.OBJECT_NOT_FOUND,
                OBJECT_NOT_FOUND_MESSAGE(islandId),
            );
        }

        return object;
    }

    readAlive(islandId: string): ActiveObject[] {
        return this.islandSpawnObjectMemoryStorage.readAlive(islandId);
    }

    readDead(islandId: string): ActiveObject[] {
        return this.islandSpawnObjectMemoryStorage.readDead(islandId);
    }
}
