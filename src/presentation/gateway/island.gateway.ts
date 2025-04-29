import { Logger, UseGuards } from '@nestjs/common';
import { Namespace } from 'socket.io';
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
    ClientToServer,
    ServerToClient,
    TypedSocket,
} from 'src/presentation/dto/game/socket/type';
import { ChatMessageService } from 'src/domain/services/chat-messages/chat-message.service';

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
    private readonly wss: Namespace<ClientToServer, ServerToClient>;

    private readonly logger = new Logger(IslandGateway.name);

    constructor(
        private readonly gameService: GameService,
        private readonly chatMessageService: ChatMessageService,
    ) {}

    @SubscribeMessage('playerJoin')
    async handlePlayerJoin(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody() data: PlayerJoinRequest,
        @CurrentUserFromSocket() userId: string,
    ) {
        const kickedPlayer = await this.gameService.kickPlayerById(userId);
        if (kickedPlayer) {
            const { clientId, roomId, id } = kickedPlayer;
            const kickedClient = this.wss.sockets.get(clientId);

            await this.gameService.leaveRoom(roomId, id);
            await kickedClient?.leave(roomId);

            client.to(roomId).emit('playerLeft', { id });
            kickedClient?.emit('playerKicked');
        }

        const { x, y } = data;

        this.logger.log(`joined player : ${userId}`);
        const { activePlayers, availableIsland, joinedPlayer } =
            await this.gameService.joinRoom(userId, client.id, x, y);

        await client.join(availableIsland.id);
        client.emit('playerJoinSuccess', { x, y });
        client.emit('activePlayers', activePlayers);
        client
            .to(availableIsland.id)
            .emit('playerJoin', { ...joinedPlayer, x, y });
    }

    @SubscribeMessage('playerLeft')
    async handlePlayerLeft(
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() userId: string,
    ) {
        const player = await this.gameService.leftPlayer(userId);
        if (player) {
            await client.leave(player.roomId);
            client.to(player.roomId).emit('playerLeft', { id: player.id });

            this.logger.log(`Leave cilent: ${client.id}`);
        }
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
        this.logger.log(`Connected new client to Zone: ${client.id}`);
    }

    async handleDisconnect(client: TypedSocket & { userId: string }) {
        const userId = client.userId;
        const player = this.gameService.getPlayer(userId);
        this.logger.debug(
            `call disconnect id from Zone:${client.userId} disconnected`,
        );
        if (!player || player.clientId !== client.id) return;

        const { roomId } = player;
        await client.leave(roomId);
        await this.gameService.leaveRoom(roomId, player.id);
        client.to(roomId).emit('playerLeft', { id: player.id });
        this.logger.debug(`Cliend id from Zone:${player.id} disconnected`);
    }
}
