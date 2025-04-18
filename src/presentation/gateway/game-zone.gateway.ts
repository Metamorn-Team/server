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
import { v4 } from 'uuid';
import { CurrentUserFromSocket } from 'src/common/decorator/current-user.decorator';
import { WsAuthGuard } from 'src/common/guard/ws-auth.guard';
import { GameService } from 'src/domain/services/game/game.service';
import { UserReader } from 'src/domain/components/users/user-reader';
import { PlayerJoinRequest } from 'src/presentation/dto/game/request/player-join.request';
import {
    ClientToServer,
    ServerToClient,
    TypedSocket,
} from 'src/presentation/dto/game/socket/type';
import { SendMessageRequest } from 'src/presentation/dto/game/request/send-message.request';
import { ChatMessageService } from 'src/domain/services/chat-messages/chat-message.service';

@UseGuards(WsAuthGuard)
@WebSocketGateway({
    namespace: 'game/zone',
    cors: {
        origin: true,
    },
})
export class GameZoneGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    private readonly wss: Namespace<ClientToServer, ServerToClient>;

    private readonly logger = new Logger(GameZoneGateway.name);

    constructor(
        private readonly zoneService: GameService,
        private readonly chatMessageService: ChatMessageService,
        private readonly userReader: UserReader,
    ) {}

    @SubscribeMessage('playerJoin')
    async handlePlayerJoin(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody() data: PlayerJoinRequest,
        @CurrentUserFromSocket() userId: string,
    ) {
        const kickedPlayer = this.zoneService.kickPlayerById(userId);
        if (kickedPlayer) {
            const { clientId, roomId, id } = kickedPlayer;
            const kickedClient = this.wss.sockets.get(clientId);

            await this.zoneService.leaveRoom(roomId, id);
            kickedClient?.leave(roomId);

            client.to(roomId).emit('playerLeft', { id });
            kickedClient?.emit('playerKicked');
        }

        const { roomType, x, y } = data;

        this.logger.log(`joined player : ${userId}`);
        const { activePlayers, availableIsland, joinedPlayer } =
            await this.zoneService.joinRoom(roomType, userId, client.id, x, y);

        client.join(availableIsland.id);
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
        const player = await this.zoneService.leftPlayer(userId);
        if (player) {
            client.leave(player.roomId);
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
        const movedPlayer = this.zoneService.move(userId, data.x, data.y);
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
    async handleAttack(@CurrentUserFromSocket() userId: string) {
        // NOTE 현재는 플레이어만
        try {
            const { attacker, attackedPlayers } =
                this.zoneService.attack(userId);

            this.wss.to(attacker.roomId).emit('attacked', {
                attackerId: attacker.id,
                attackedPlayerIds: attackedPlayers.map((player) => player.id),
            });

            this.logger.debug(
                `공격 성공: ${attackedPlayers.map((player) => player.nickname)}`,
            );
        } catch (e) {
            this.logger.error(`공격 실패: ${e}`);
        }
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() data: SendMessageRequest,
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() senderId: string,
    ) {
        try {
            const player = await this.chatMessageService.sendMessage(
                senderId,
                data.message,
            );

            client.emit('messageSent', {
                messageId: v4(),
                message: data.message,
            });
            client
                .to(player.roomId)
                .emit('receiveMessage', { senderId, message: data.message });

            this.logger.debug(`전송자: ${senderId}`);
            this.logger.debug(`메시지: ${data.message}`);
        } catch (e) {
            this.logger.error(`메세지 전송 실패: ${e}`);
        }
    }

    // -----------------------------------------------------------

    afterInit() {
        this.logger.debug('GameGateway Initialized!!');
    }

    handleConnection(client: TypedSocket) {
        this.logger.log(`Connected new client to Zone: ${client.id}`);
    }

    handleDisconnect(client: TypedSocket & { userId: string }) {
        const userId = client.userId;
        const player = this.zoneService.getPlayer(userId);
        this.logger.debug(
            `call disconnect id from Zone:${client.userId} disconnected`,
        );
        if (!player || player.clientId !== client.id) return;

        const { roomId } = player;
        client.leave(roomId);
        this.zoneService.leaveRoom(roomId, player.id);
        client.to(roomId).emit('playerLeft', { id: player.id });
        this.logger.debug(`Cliend id from Zone:${player.id} disconnected`);
    }
}
