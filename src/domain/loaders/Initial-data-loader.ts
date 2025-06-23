import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IslandActiveObjectWriter } from 'src/domain/components/island-spawn-object/island-active-object-writer';
import { IslandObjectReader } from 'src/domain/components/island-spawn-object/island-object-reader';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { ActiveObject } from 'src/domain/types/spawn-object/active-object';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';

@Injectable()
export class InitialDataLoader implements OnModuleInit {
    constructor(
        @Inject(PlayerStorage)
        private readonly playerStorage: PlayerStorage,
        private readonly playerMemoryStorage: PlayerMemoryStorage,
        private readonly islandObjectReader: IslandObjectReader,
        private readonly islandActiveObjectWriter: IslandActiveObjectWriter,
    ) {}

    async onModuleInit() {
        if (process.env.NODE_ENV === 'test') return;
        const players = await this.playerStorage.getAllPlayers();
        players.forEach((player) => this.playerMemoryStorage.addPlayer(player));

        const persistentObject = await this.islandObjectReader.readAll();
        const activeObjects = persistentObject.map((object) =>
            ActiveObject.fromPersistentObject(object),
        );
        this.islandActiveObjectWriter.createMany(activeObjects);
    }
}
