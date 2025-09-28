import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DESERTED_MAX_MEMBERS } from 'src/common/constants';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { UserReader } from 'src/domain/components/users/user-reader';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { Player } from 'src/domain/models/game/player';
import {
    LiveDesertedIsland,
    LiveIsland,
    SocketClientId,
} from 'src/domain/types/game.types';
import { IslandTypeEnum, JoinIslandInput } from 'src/domain/types/island.types';
import { ISLAND_FULL } from 'src/domain/exceptions/client-use-messag';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { DesertedIslandStorageWriter } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-writer';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { IslandManagerFactory } from 'src/domain/components/islands/factory/island-manager-factory';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { EquipmentReader } from 'src/domain/components/equipments/equipment-reader';
import { MapReader } from 'src/domain/components/map/map-reader';
import { PlayerSpawnPointReader } from 'src/domain/components/player-spawn-point/player-spawn-point-reader';
import { IslandActiveObjectSpawner } from 'src/domain/components/island-spawn-object/island-active-object-spawner';
import { Logger } from 'winston';
import { PrivateIslandReader } from 'src/domain/components/islands/private-island-reader';

@Injectable()
export class GameIslandService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        private readonly equipmentReader: EquipmentReader,
        private readonly islandWriter: IslandWriter,
        private readonly islandJoinWriter: IslandJoinWriter,
        private readonly userReader: UserReader,

        private readonly playerStorageReader: PlayerStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
        private readonly desertedIslandStorageWriter: DesertedIslandStorageWriter,
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly privateIslandReader: PrivateIslandReader,
        private readonly islandManagerFactory: IslandManagerFactory,
        private readonly mapReader: MapReader,
        private readonly playerSpawnPointReader: PlayerSpawnPointReader,
        private readonly islandActiveObjectSpawner: IslandActiveObjectSpawner,
    ) {}

    async getAvailableDesertedIsland() {
        const islands = await this.desertedIslandStorageReader.readAll();

        if (islands.length === 0) {
            return await this.createIsland();
        }

        const joinableIslands = islands.filter(
            (island) => island.players.size < island.max,
        );

        return joinableIslands[
            Math.floor(Math.random() * joinableIslands.length)
        ];
    }

    async createLiveIsland(islandId: string, mapKey: string) {
        const liveIsland: LiveDesertedIsland = {
            id: islandId,
            max: DESERTED_MAX_MEMBERS,
            players: new Set<SocketClientId>(),
            type: IslandTypeEnum.DESERTED,
            mapKey,
        };
        await this.desertedIslandStorageWriter.create(liveIsland);

        return liveIsland;
    }

    async createIsland(): Promise<LiveIsland> {
        const maps = await this.mapReader.readAll();
        const map = maps[Math.floor(Math.random() * maps.length)];

        const island = await this.islandWriter.create({
            type: IslandTypeEnum.DESERTED,
            maxMembers: DESERTED_MAX_MEMBERS,
            mapId: map.id,
        });

        const liveIsland = await this.createLiveIsland(island.id, map.key);
        // 오브젝트 초기화
        await this.islandActiveObjectSpawner.spawnInitialObjects(
            island.id,
            map.id,
        );

        return liveIsland;
    }

    getIsland(islandId: string) {
        return this.desertedIslandStorageReader.readOne(islandId);
    }

    async joinIsland(input: JoinIslandInput) {
        const { playerId, clientId, type, islandId, password } = input;

        const user = await this.userReader.readProfile(playerId);
        const island = await this.getAvailableIsland(type, islandId);
        const manager = this.islandManagerFactory.get(type);

        const spawnPoint = await this.playerSpawnPointReader.readRandomPoint(
            island.mapKey,
        );

        const player = Player.from({
            user,
            islandId: island.id,
            islandType: type,
            spawnPoint,
            clientId,
        });
        const equipmentState = await this.equipmentReader.readEquipmentState(
            player.id,
        );

        await manager.join(player, password);

        const activePlayers = await manager.getActiveUsers(island.id, playerId);
        void this.createIslandJoinData(island.id, playerId);

        return {
            activePlayers,
            joinedIsland: {
                id: island.id,
                mapKey: island.mapKey,
            },
            joinedPlayer: Object.assign(player, { equipmentState }),
        };
    }

    async getAvailableIsland(type: IslandTypeEnum, islandId?: string) {
        if (type === IslandTypeEnum.DESERTED) {
            return await this.getAvailableDesertedIsland();
        }

        if (!islandId) {
            throw new Error('islandId is required');
        }
        if (type === IslandTypeEnum.NORMAL) {
            return await this.normalIslandStorageReader.readOne(islandId);
        }
        return await this.privateIslandReader.readOne(islandId);
    }

    createIslandJoinData(islandId: string, userId: string) {
        this.islandJoinWriter.create({ islandId, userId }).catch((e) => {
            this.logger.error(
                `섬 참여 데이터 저장 실패: ${islandId}, userId: ${userId}`,
                e,
            );
        });
    }

    async handleLeave(player: Player) {
        const manager = this.islandManagerFactory.get(player.islandType);
        return await manager.handleLeave(player);
    }

    async leave(playerId: string) {
        const player = await this.playerStorageReader.readOne(playerId);
        return await this.handleLeave(player);
    }

    async leaveByDisconnect(clientId: string) {
        const player =
            await this.playerStorageReader.readOneByClientId(clientId);
        return await this.handleLeave(player);
    }

    async kick(playerId: string) {
        try {
            const player = await this.playerStorageReader.readOne(playerId);
            const { roomId: islandId, islandType } = player;

            const manager = this.islandManagerFactory.get(islandType);
            await manager.left(islandId, playerId);

            return player;
        } catch (e) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE
            ) {
                return;
            }
            throw e;
        }
    }

    async checkCanJoin(islandId: string): Promise<{
        islandId?: string;
        canJoin: boolean;
        reason?: string;
    }> {
        try {
            const canJoin = await this.islandManagerFactory
                .get(IslandTypeEnum.NORMAL)
                .canJoin(islandId);

            if (!canJoin) {
                return {
                    canJoin,
                    reason: ISLAND_FULL,
                };
            }

            return { islandId, canJoin };
        } catch (e: unknown) {
            if (e instanceof DomainException) {
                if (
                    e.errorType ===
                    DomainExceptionType.ISLAND_NOT_FOUND_IN_STORAGE
                ) {
                    return {
                        canJoin: false,
                        reason: ISLAND_NOT_FOUND_MESSAGE,
                    };
                }
            }
            throw e;
        }
    }
}
