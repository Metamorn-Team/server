import { Logger, UseFilters } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { CurrentUserFromSocket } from 'src/common/decorator/current-user.decorator';
import { GameService } from 'src/domain/services/game/game.service';
import { PlayerJoinRequest } from 'src/presentation/dto/game/request/player-join.request';
import {
    ClientToIsland,
    IslandSettingsToClient,
    IslandToClient,
} from 'src/presentation/dto/game/socket/type';
import { GameIslandService } from 'src/domain/services/game/game-island.service';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';
import { WsConnectionAuthenticator } from 'src/common/ws-auth/ws-connection-authenticator';
import { WsExceptions } from 'src/presentation/dto/game/socket/known-exception';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { checkAppVersion } from 'test/unit/utils/check-app-version';
import { IslandActiveObjectReader } from 'src/domain/components/island-spawn-object/island-active-object-reader';
import { IslandActiveObject } from 'src/presentation/dto/game/response/player-join-success.response';

type TypedSocket = Socket<
    ClientToIsland,
    IslandToClient & IslandSettingsToClient
>;

@UseFilters(WsExceptionFilter)
@WebSocketGateway({
    path: '/game',
    namespace: 'island',
    cors: {
        origin: true,
    },
})
export class IslandGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    private readonly wss: Namespace<
        ClientToIsland,
        IslandToClient & IslandSettingsToClient
    >;

    private readonly logger = new Logger(IslandGateway.name);

    constructor(
        private readonly wsConnectionAuthenticator: WsConnectionAuthenticator,
        private readonly playerStorageReader: PlayerStorageReader,
        private readonly gameService: GameService,
        private readonly gameIslandService: GameIslandService,
        private readonly islandActiveObjectReader: IslandActiveObjectReader,
    ) {}

    async kick(userId: string, client: TypedSocket) {
        const kickedPlayer = await this.gameIslandService.kick(userId);
        if (kickedPlayer) {
            const { clientId, roomId, id } = kickedPlayer;

            const kickedClient = this.wss.sockets.get(clientId);
            await kickedClient?.leave(roomId);

            client.to(roomId).emit('playerLeft', { id });
            kickedClient?.emit('playerKicked');
        }
    }

    @SubscribeMessage('joinDesertedIsland')
    async handleJoinDesertedIsland(
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() userId: string,
    ) {
        await this.kick(userId, client);

        this.logger.log(`joined player : ${userId}`);

        const { activePlayers, joinedIsland, joinedPlayer } =
            await this.gameIslandService.joinDesertedIsland(userId, client.id);

        const activeObjects = this.islandActiveObjectReader
            .readAll(joinedIsland.id)
            .map((object) => IslandActiveObject.fromActiveObject(object));

        const { x, y } = joinedPlayer;

        await client.join(joinedIsland.id);
        client.emit('playerJoinSuccess', {
            x,
            y,
            mapKey: joinedIsland.mapKey,
            activeObjects,
        });
        client.emit('activePlayers', activePlayers);
        client
            .to(joinedIsland.id)
            .emit('playerJoin', { ...joinedPlayer, x, y });
    }

    @SubscribeMessage('joinNormalIsland')
    async handlePlayerJoin(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody() data: PlayerJoinRequest,
        @CurrentUserFromSocket() userId: string,
    ) {
        await this.kick(userId, client);

        const { islandId } = data;

        this.logger.log(`joined player : ${userId}`);

        const { activePlayers, joinedIsland, joinedPlayer } =
            await this.gameIslandService.joinNormalIsland(
                userId,
                client.id,
                islandId,
            );
        const activeObjects = this.islandActiveObjectReader
            .readAll(joinedIsland.id)
            .map((object) => IslandActiveObject.fromActiveObject(object));
        const { x, y } = joinedPlayer;

        await client.join(joinedIsland.id);
        client.emit('playerJoinSuccess', {
            x,
            y,
            mapKey: joinedIsland.mapKey,
            activeObjects,
        });
        client.emit('activePlayers', activePlayers);
        client
            .to(joinedIsland.id)
            .emit('playerJoin', { ...joinedPlayer, x, y });
    }

    @SubscribeMessage('playerLeft')
    async handlePlayerLeft(
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() userId: string,
    ) {
        const { player, ownerChanged } =
            await this.gameIslandService.leave(userId);
        if (player) {
            if (ownerChanged) {
                this.wss
                    .to(player.roomId)
                    .emit('islandInfoUpdated', { islandId: player.roomId });
            }

            await client.leave(player.roomId);
            client.emit('playerLeftSuccess');
            client.to(player.roomId).emit('playerLeft', { id: player.id });

            this.logger.log(`Leave cilent: ${client.id}`);
        }
    }

    @SubscribeMessage('playerMoved')
    async handlePlayerMoved(
        @MessageBody() data: { x: number; y: number },
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() userId: string,
    ) {
        const movedPlayer = await this.gameService.move(userId, data.x, data.y);
        if (movedPlayer) {
            client.to(movedPlayer.roomId).emit('playerMoved', {
                id: movedPlayer.id,
                x: movedPlayer.x,
                y: movedPlayer.y,
            });
        }
    }

    @SubscribeMessage('attack')
    async handleAttack(@CurrentUserFromSocket() userId: string) {
        // NOTE 현재는 플레이어만
        try {
            const { attacker, attackedPlayers } =
                await this.gameService.attackPlayer(userId);

            this.wss.to(attacker.roomId).emit('attacked', {
                attackerId: attacker.id,
                attackedPlayerIds: attackedPlayers.map((player) => player.id),
            });
        } catch (e) {
            this.logger.error(`공격 실패: ${e as string}`);
        }
    }

    @SubscribeMessage('strongAttack')
    async handleStrongAttack(@CurrentUserFromSocket() userId: string) {
        try {
            const { attacker, attackedPlayers } =
                await this.gameService.attackObject(userId);
            this.logger.debug('오브젝트 공격: ', attackedPlayers);

            this.wss.to(attacker.roomId).emit('strongAttacked', {
                attackerId: attacker.id,
                attackedPlayerIds: attackedPlayers.map((player) => player.id),
            });
        } catch (e) {
            this.logger.error(`공격 실패: ${e as string}`);
        }
    }

    @SubscribeMessage('jump')
    async jump(
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() userId: string,
    ) {
        const { roomId } = await this.playerStorageReader.readOne(userId);
        client.to(roomId).emit('jump', userId);
    }

    @SubscribeMessage('islandHearbeat')
    async handleHeartbeat(
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() userId: string,
    ) {
        const appVersion = client.handshake.auth['app-version'] as
            | string
            | undefined;
        if (!checkAppVersion(appVersion)) client.emit('invalidVersion');

        this.logger.debug(appVersion);

        const heartbeats = await this.gameService.hearbeatFromIsland(userId);

        client.emit('islandHearbeat', heartbeats);
    }

    // -----------------------------------------------------------

    afterInit() {
        this.logger.debug('GameGateway Initialized!!');
    }

    async handleConnection(client: TypedSocket) {
        try {
            await this.wsConnectionAuthenticator.authenticate(client);
            this.logger.log(`Connected new client to Island: ${client.id}`);
        } catch (e) {
            client.emit('wsError', {
                name: WsExceptions.INVALID_TOKEN,
                message: WsExceptions.INVALID_TOKEN,
            });
            client.disconnect(true);
        }
    }

    async handleDisconnect(client: TypedSocket & { userId: string }) {
        try {
            const { player, ownerChanged } =
                await this.gameIslandService.leaveByDisconnect(client.id);
            const { roomId: islandId } = player;

            if (ownerChanged) {
                this.wss
                    .to(player.roomId)
                    .emit('islandInfoUpdated', { islandId: player.roomId });
            }

            await client.leave(islandId);
            client.to(islandId).emit('playerLeft', { id: player.id });

            this.logger.debug(
                `Cliend id from Island:${player.id} disconnected`,
            );
        } catch (e) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE
            ) {
                return;
            }
        }
    }
}
