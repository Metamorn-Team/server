import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { SocketClientId } from 'src/domain/types/game.types';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { ATTACK_BOX_SIZE } from 'src/constants/game/attack-box';
import { PLAYER_HIT_BOX } from 'src/constants/game/hit-box';
import { MOVING_THRESHOLD } from 'src/constants/threshold';
import { UserReader } from 'src/domain/components/users/user-reader';
import { Player } from 'src/domain/models/game/player';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { UNINHABITED_MAX_MEMBERS } from 'src/common/constants';

@Injectable()
export class GameService {
    constructor(
        @Inject(GameStorage)
        private readonly gameStorage: GameStorage,
        private readonly islandWriter: IslandWriter,
        private readonly islandJoinWriter: IslandJoinWriter,
        private readonly userReader: UserReader,
    ) {}

    async createRoom() {
        const islandEntity = IslandEntity.create(
            {
                type: IslandTypeEnum.DESERTED,
                maxMembers: UNINHABITED_MAX_MEMBERS,
            },
            v4,
        );
        await this.islandWriter.create(islandEntity);

        const { id } = islandEntity;
        const island = {
            id,
            max: UNINHABITED_MAX_MEMBERS,
            players: new Set<SocketClientId>(),
            type: IslandTypeEnum.DESERTED,
        };
        this.gameStorage.createIsland(id, island);
        const roomOfTags = this.gameStorage.getIslandOfTag(
            IslandTypeEnum.DESERTED,
        );

        if (roomOfTags) {
            roomOfTags.add(id);
        } else {
            this.gameStorage.addIslandOfTag(IslandTypeEnum.DESERTED, id);
        }

        return island;
    }

    async getAvailableRoom() {
        const islandIds = this.gameStorage.getIslandIdsByTag(
            IslandTypeEnum.DESERTED,
        );

        if (islandIds) {
            for (const islandId of islandIds) {
                const room = this.gameStorage.getIsland(islandId);

                if (room && room.players.size < room.max) {
                    return room;
                }
            }
        }

        return await this.createRoom();
    }

    getIsland(islandId: string) {
        return this.gameStorage.getIsland(islandId);
    }

    async joinIsland(playerId: string, clientId: string, x: number, y: number) {
        const availableIsland = await this.getAvailableRoom();
        const user = await this.userReader.readProfile(playerId);

        const { id, nickname, avatarKey, tag } = user;
        const { id: islandId } = availableIsland;
        const player = Player.create({
            id,
            clientId,
            nickname,
            avatarKey,
            tag,
            roomId: islandId,
            x,
            y,
        });

        this.gameStorage.addPlayer(playerId, player);

        const stdDate = new Date();
        const islandJoin = IslandJoinEntity.create(
            { islandId, userId: player.id },
            v4,
            stdDate,
        );
        await this.islandJoinWriter.create(islandJoin);

        const room = this.gameStorage.getIsland(islandId);
        if (!room) throw new Error('없는 방');

        room.players.add(playerId);

        const activePlayers =
            this.getActiveUsers(availableIsland.id).filter(
                (player) => player.id !== playerId,
            ) || [];

        return {
            activePlayers,
            availableIsland,
            joinedPlayer: player,
        };
    }

    async leftPlayer(playerId: string) {
        const player = this.gameStorage.getPlayer(playerId);
        if (!player) return;

        const room = this.gameStorage.getIsland(player.roomId);
        if (!room) return;

        const { roomId } = player;

        await this.islandJoinWriter.left(roomId, player.id);

        this.gameStorage.deletePlayer(playerId);
        room.players.delete(playerId);

        return player;
    }

    async leaveRoom(islandId: string, playerId: string) {
        const player = this.gameStorage.getPlayer(playerId);
        if (!player) return;

        const room = this.gameStorage.getIsland(islandId);
        if (!room) return;

        await this.islandJoinWriter.left(islandId, player.id);

        this.gameStorage.deletePlayer(playerId);
        room.players.delete(playerId);

        return player;
    }

    getActiveUsers(islandId: string) {
        const room = this.gameStorage.getIsland(islandId);
        if (!room) throw new Error('없는 방');

        const activeUsers: Player[] = [];

        room.players.forEach((playerId) => {
            const player = this.gameStorage.getPlayer(playerId);
            if (player) {
                activeUsers.push(player);
            }
        });

        return activeUsers;
    }

    async kickPlayerById(playerId: string) {
        const player = this.gameStorage.getPlayer(playerId);
        if (player) {
            await this.leaveRoom(player.roomId, playerId);
            return player;
        }
    }

    getPlayer(playerId: string) {
        return this.gameStorage.getPlayer(playerId);
    }

    getPlayerByClientId(clientId: string) {
        return this.gameStorage.getPlayerByClientId(clientId);
    }

    move(playerId: string, x: number, y: number): Player | null {
        const player = this.gameStorage.getPlayer(playerId);

        if (!player) return null;
        if (player.lastMoved + MOVING_THRESHOLD > Date.now()) return null;
        if (player.x === x && player.y === y) return null;

        player.isFacingRight =
            player.x < x ? true : player.x > x ? false : player.isFacingRight;

        player.setPosition(x, y);
        return player;
    }

    attack(attackerId: string) {
        const attacker = this.gameStorage.getPlayer(attackerId);
        if (!attacker) throw new Error('없는 회원');

        const island = this.gameStorage.getIsland(attacker.roomId);
        if (!island) throw new Error('없는 섬');

        if (island.players.size === 0) {
            return {
                attacker,
                attackedPlayers: [],
            };
        }

        // 아바타 추가되면 avatarKey에 따라 분기
        const boxSize = ATTACK_BOX_SIZE.PAWN;
        const attackBox = {
            x: attacker.isFacingRight
                ? attacker.x + boxSize.width / 2
                : attacker.x - boxSize.width / 2,
            y: attacker.y,
            width: boxSize.width,
            height: boxSize.height,
        };

        const attackedPlayers = Array.from(island.players)
            .map((playerId) => this.getPlayer(playerId))
            .filter((player) => player !== null)
            .filter((player) => player.id !== attacker.id)
            .filter((player) => this.isInAttackBox(player, attackBox));
        attacker.updateLastActivity();

        return {
            attacker,
            attackedPlayers,
        };
    }

    isInAttackBox(
        player: Player,
        box: { x: number; y: number; width: number; height: number },
    ) {
        // 캐릭터 추가되면 상수로 관리
        const playerRadius = PLAYER_HIT_BOX.PAWN.RADIUS;

        const boxLeft = box.x - box.width / 2;
        const boxRight = box.x + box.width / 2;
        const boxTop = box.y - box.height / 2;
        const boxBottom = box.y + box.height / 2;

        if (
            player.x >= boxLeft &&
            player.x <= boxRight &&
            player.y >= boxTop &&
            player.y <= boxBottom
        ) {
            return true;
        }

        const closestX = Math.max(boxLeft, Math.min(player.x, boxRight));
        const closestY = Math.max(boxTop, Math.min(player.y, boxBottom));

        const distanceX = player.x - closestX;
        const distanceY = player.y - closestY;

        const distanceSquared = distanceX * distanceX + distanceY * distanceY;

        return distanceSquared < playerRadius * playerRadius;
    }

    hearbeatFromIsland(
        playerId: string,
    ): { id: string; lastActivity: number }[] {
        const player = this.gameStorage.getPlayer(playerId);
        if (!player) throw new Error();

        const players = this.gameStorage.getPlayersByIslandId(player.roomId);
        return players.map((player) => ({
            id: player.id,
            lastActivity: player.lastActivity,
        }));
    }

    loggingStore(logger: Logger) {
        logger.debug('전체 회원', this.gameStorage.getPlayerStore());
        logger.debug('전체 방', this.gameStorage.getIslandStore());
        logger.debug('타입별 방', this.gameStorage.getIslandOfTagStore());
    }
}
