import { Injectable, Logger } from '@nestjs/common';
import { DESERTED_MAX_MEMBERS } from 'src/common/constants';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { UserReader } from 'src/domain/components/users/user-reader';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { Player } from 'src/domain/models/game/player';
import {
    JoinedIslandInfo,
    LiveDesertedIsland,
    LiveIsland,
    SocketClientId,
} from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { ISLAND_FULL } from 'src/domain/exceptions/client-use-messag';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { DesertedIslandStorageWriter } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-writer';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { IslandManagerFactory } from 'src/domain/components/islands/factory/island-manager-factory';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { PLAYER_HIT_BOX } from 'src/constants/game/hit-box';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { EquipmentReader } from 'src/domain/components/equipments/equipment-reader';
import { MapReader } from 'src/domain/components/map/map-reader';
import { PlayerSpawnPointReader } from 'src/domain/components/player-spawn-point/player-spawn-point-reader';

@Injectable()
export class GameIslandService {
    private readonly logger = new Logger(GameIslandService.name);

    constructor(
        private readonly equipmentReader: EquipmentReader,
        private readonly islandWriter: IslandWriter,
        private readonly islandJoinWriter: IslandJoinWriter,
        private readonly userReader: UserReader,

        private readonly playerStorageReader: PlayerStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
        private readonly desertedIslandStorageWriter: DesertedIslandStorageWriter,
        private readonly normalIslandStorageReader: NormalIslandStorageReader,

        private readonly islandManagerFactory: IslandManagerFactory,
        private readonly mapReader: MapReader,
        private readonly playerSpawnPointReader: PlayerSpawnPointReader,
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

    async createIsland(): Promise<LiveIsland> {
        const maps = await this.mapReader.readAll();
        const map = maps[Math.floor(Math.random() * maps.length)];

        const island = await this.islandWriter.create({
            type: IslandTypeEnum.DESERTED,
            maxMembers: DESERTED_MAX_MEMBERS,
            mapId: map.id,
        });

        return this.createLiveIsland(island.id, map.key);
    }

    getIsland(islandId: string) {
        return this.desertedIslandStorageReader.readOne(islandId);
    }

    async joinNormalIsland(
        playerId: string,
        clientId: string,
        islandId: string,
    ): Promise<JoinedIslandInfo> {
        const user = await this.userReader.readProfile(playerId);
        const island = await this.normalIslandStorageReader.readOne(islandId);
        const manager = this.islandManagerFactory.get(IslandTypeEnum.NORMAL);

        // TODO 기본 값 제거
        const spawnPoint = await this.playerSpawnPointReader.readRandomPoint(
            island.mapKey || 'island',
        );

        const player = Player.create({
            id: user.id,
            avatarKey: user.avatarKey,
            clientId,
            nickname: user.nickname,
            roomId: islandId,
            islandType: island.type,
            tag: user.tag,
            x: spawnPoint.x,
            y: spawnPoint.y,
            radius: PLAYER_HIT_BOX.PAWN.RADIUS,
        });
        const equipmentState = await this.equipmentReader.readEquipmentState(
            player.id,
        );
        await manager.join(player);

        const activePlayers = await manager.getActiveUsers(islandId, playerId);
        void this.createIslandJoinData(islandId, playerId);

        return {
            activePlayers,
            joinedIsland: {
                id: island.id,
                // TODO required로 변경되면 default 제거
                mapKey: island.mapKey || 'island',
            },
            joinedPlayer: { ...player, equipmentState },
        };
    }

    async joinDesertedIsland(
        playerId: string,
        clientId: string,
    ): Promise<JoinedIslandInfo> {
        const user = await this.userReader.readProfile(playerId);
        const manager = this.islandManagerFactory.get(IslandTypeEnum.DESERTED);

        const joinableIsland = await this.getAvailableDesertedIsland();
        // TODO 기본 값 제거
        const spawnPoint = await this.playerSpawnPointReader.readRandomPoint(
            joinableIsland.mapKey || 'island',
        );

        const { id: islandId, type } = joinableIsland;
        const player = Player.create({
            id: user.id,
            clientId,
            nickname: user.nickname,
            avatarKey: user.avatarKey,
            islandType: type,
            tag: user.tag,
            roomId: islandId,
            x: spawnPoint.x,
            y: spawnPoint.y,
            radius: PLAYER_HIT_BOX.PAWN.RADIUS,
        });
        const equipmentState = await this.equipmentReader.readEquipmentState(
            player.id,
        );
        await manager.join(player);

        const activePlayers = await manager.getActiveUsers(islandId, playerId);
        void this.islandJoinWriter.create({ islandId, userId: playerId });

        return {
            activePlayers,
            joinedIsland: {
                id: joinableIsland.id,
                // TODO required로 변경되면 default 제거
                mapKey: joinableIsland.mapKey || 'island',
            },
            joinedPlayer: { ...player, equipmentState },
        };
    }

    createIslandJoinData(islandId: string, userId: string) {
        this.islandJoinWriter.create({ islandId, userId }).catch((e) => {
            this.logger.error(
                `섬 참여 데이터 저장 실패: ${islandId}, userId: ${userId}`,
                e,
            );
        });
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
            await this.islandManagerFactory
                .get(IslandTypeEnum.NORMAL)
                .canJoin(islandId);

            return { islandId, canJoin: true };
        } catch (e: unknown) {
            if (e instanceof DomainException) {
                if (e.errorType === DomainExceptionType.ISLAND_FULL) {
                    return {
                        canJoin: false,
                        reason: ISLAND_FULL,
                    };
                }
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
