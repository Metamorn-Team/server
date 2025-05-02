import { Logger, UseGuards } from '@nestjs/common';
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
import { WsAuthGuard } from 'src/common/guard/ws-auth.guard';
import { GameService } from 'src/domain/services/game/game.service';
import { PlayerJoinRequest } from 'src/presentation/dto/game/request/player-join.request';
import {
    ClientToIsland,
    IslandToClient,
} from 'src/presentation/dto/game/socket/type';
import { GameIslandService } from 'src/domain/services/game/game-island.service';
import { JoinDesertedIslandReqeust } from 'src/presentation/dto/game/request/join-deserted-island.request';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { IslandTypeEnum } from 'src/domain/types/island.types';

type TypedSocket = Socket<ClientToIsland, IslandToClient>;

@UseGuards(WsAuthGuard)
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
    private readonly wss: Namespace<ClientToIsland, IslandToClient>;

    private readonly logger = new Logger(IslandGateway.name);

    constructor(
        private readonly gameService: GameService,
        private readonly gameIslandService: GameIslandService,
    ) {}

    async kick(
        userId: string,
        client: TypedSocket,
        islandType: IslandTypeEnum,
    ) {
        const kickedPlayer = await this.gameIslandService.kickPlayerById(
            userId,
            islandType,
        );
        if (kickedPlayer) {
            const { clientId, roomId, id } = kickedPlayer;
            const kickedClient = this.wss.sockets.get(clientId);

            await this.gameIslandService.leaveRoom(roomId, id, islandType);
            await kickedClient?.leave(roomId);

            client.to(roomId).emit('playerLeft', { id });
            kickedClient?.emit('playerKicked');
        }
    }

    @SubscribeMessage('joinDesertedIsland')
    async handleJoinDesertedIsland(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody() data: JoinDesertedIslandReqeust,
        @CurrentUserFromSocket() userId: string,
    ) {
        await this.kick(userId, client, IslandTypeEnum.DESERTED);

        const { x, y } = data;

        this.logger.log(`joined player : ${userId}`);

        const { activePlayers, joinedIslandId, joinedPlayer } =
            await this.gameIslandService.joinDesertedIsland(
                userId,
                client.id,
                x,
                y,
            );

        await client.join(joinedIslandId);
        client.emit('playerJoinSuccess', { x, y });
        client.emit('activePlayers', activePlayers);
        client.to(joinedIslandId).emit('playerJoin', { ...joinedPlayer, x, y });

        this.gameService.loggingStore(this.logger);
    }

    @SubscribeMessage('joinNormalIsland')
    async handlePlayerJoin(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody() data: PlayerJoinRequest,
        @CurrentUserFromSocket() userId: string,
    ) {
        await this.kick(userId, client, IslandTypeEnum.DESERTED);

        const { x, y, islandId } = data;

        this.logger.log(`joined player : ${userId}`);

        // type이 NORMAL이면 islandId로 참여
        const { activePlayers, joinedIslandId, joinedPlayer } =
            await this.gameIslandService.joinNormalIsland(
                userId,
                client.id,
                islandId,
                x,
                y,
            );

        await client.join(joinedIslandId);
        client.emit('playerJoinSuccess', { x, y });
        client.emit('activePlayers', activePlayers);
        client.to(joinedIslandId).emit('playerJoin', { ...joinedPlayer, x, y });

        this.gameService.loggingStore(this.logger);
    }

    @SubscribeMessage('playerLeft')
    async handlePlayerLeft(
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() userId: string,
    ) {
        const player = await this.gameIslandService.leftPlayer(userId);
        if (player) {
            await client.leave(player.roomId);
            client.to(player.roomId).emit('playerLeft', { id: player.id });

            this.logger.log(`Leave cilent: ${client.id}`);
        }

        this.gameService.loggingStore(this.logger);
    }

    @SubscribeMessage('playerMoved')
    handlePlayerMoved(
        @MessageBody() data: { x: number; y: number },
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() userId: string,
    ) {
        const movedPlayer = this.gameService.move(userId, data.x, data.y);
        if (movedPlayer) {
            client.to(movedPlayer.roomId).emit('playerMoved', {
                id: movedPlayer.id,
                x: movedPlayer.x,
                y: movedPlayer.y,
            });
            this.logger.debug(`위치 전송 x: ${data.x}, y: ${data.y}`);
        }
    }

    @SubscribeMessage('attack')
    handleAttack(@CurrentUserFromSocket() userId: string) {
        // NOTE 현재는 플레이어만
        try {
            const { attacker, attackedPlayers } =
                this.gameService.attack(userId);

            this.wss.to(attacker.roomId).emit('attacked', {
                attackerId: attacker.id,
                attackedPlayerIds: attackedPlayers.map((player) => player.id),
            });

            this.logger.debug(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `공격 성공: ${attackedPlayers.map((player) => player.nickname)}`,
            );
        } catch (e) {
            this.logger.error(`공격 실패: ${e as string}`);
        }
    }

    @SubscribeMessage('islandHearbeat')
    handleHeartbeat(
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() userId: string,
    ) {
        const heartbeats = this.gameService.hearbeatFromIsland(userId);

        client.emit('islandHearbeat', heartbeats);
    }

    // -----------------------------------------------------------

    afterInit() {
        this.logger.debug('GameGateway Initialized!!');
    }

    handleConnection(client: TypedSocket) {
        this.logger.log(`Connected new client to Island: ${client.id}`);
    }

    async handleDisconnect(client: TypedSocket & { userId: string }) {
        try {
            const userId = client.userId;
            const player = this.gameService.getPlayer(userId);
            this.logger.debug(
                `call disconnect id from Island:${client.userId} disconnected`,
            );

            if (player.clientId !== client.id) return;
            const { roomId } = player;
            await client.leave(roomId);
            await this.gameIslandService.leaveRoom(
                roomId,
                player.id,
                player.islandType,
            );
            client.to(roomId).emit('playerLeft', { id: player.id });
            this.logger.debug(
                `Cliend id from Island:${player.id} disconnected`,
            );

            this.gameService.loggingStore(this.logger);
        } catch (e) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.PlayerNotFoundInStorage
            ) {
                return;
            }

            throw e;
        }
    }
}
