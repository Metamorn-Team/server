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
import { ZoneService } from 'src/domain/services/game/zone.service';
import { UserReader } from 'src/domain/components/users/user-reader';
import { PlayerJoinRequest } from 'src/presentation/dto/game/request/player-join.request';
import { TypedSocket } from 'src/presentation/dto/game/socket/type';
import { SendMessageRequest } from 'src/presentation/dto/game/request/send-message.request';

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
    private readonly server: Namespace;

    private readonly logger = new Logger(GameZoneGateway.name);

    constructor(
        private readonly zoneService: ZoneService,
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
            const { clientId, roomId, id: playerId } = kickedPlayer;
            const kickedClient = this.server.sockets.get(clientId);

            // NOTE left 말고 kicked 해야할듯?
            kickedClient?.to(roomId).emit('playerLeft', { id: playerId });
            kickedClient?.leave(roomId);
        }
        const { roomType, x, y } = data;

        this.logger.log(`joined player : ${client.id}`);
        this.logger.debug(data);

        const availableRoom = this.zoneService.getAvailableRoom(roomType);

        const activeUsers =
            this.zoneService.getActiveUsers(availableRoom.id) || [];

        client.emit('activePlayers', activeUsers);

        const user = await this.userReader.readProfile(userId);
        this.logger.debug(user);

        const { id, nickname, avatarKey, tag } = user;
        this.zoneService.joinRoom(availableRoom.id, client.id, {
            id,
            nickname,
            tag,
            avatarKey,
            x,
            y,
            clientId: client.id,
            roomId: availableRoom.id,
        });

        client.join(availableRoom.id);
        client.to(availableRoom.id).emit('playerJoin', { ...user, x, y });
        this.zoneService.loggingStore(this.logger);
    }

    @SubscribeMessage('playerLeft')
    handlePlayerLeft(@ConnectedSocket() client: TypedSocket) {
        const player = this.zoneService.getPlayer(client.id);
        if (!player) return;

        const { roomId } = player;
        client.leave(player.roomId);
        this.zoneService.leaveRoom(player.roomId, client.id);
        this.logger.log(`Leave cilent: ${client.id}`);

        client.to(roomId).emit('playerLeft', { id: player.id });
    }

    @SubscribeMessage('playerMoved')
    handlePlayerMoved(
        @MessageBody() data: { x: number; y: number },
        @ConnectedSocket() client: TypedSocket,
    ) {
        this.logger.log(`${client.id}: move to { x: ${data.x}, y: ${data.y} }`);

        const player = this.zoneService.getPlayer(client.id);
        if (player) {
            player.x = data.x;
            player.y = data.y;
            client.to(player.roomId).emit('playerMoved', {
                id: player.id,
                x: data.x,
                y: data.y,
            });
        }
    }

    @SubscribeMessage('sendMessage')
    handleSendMessage(
        @MessageBody() data: SendMessageRequest,
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() senderId: string,
    ) {
        this.logger.debug(`전송자: ${senderId}`);
        this.logger.debug(`메시지: ${data.message}`);

        // 채팅 저장 비동기
        const sender = this.zoneService.getPlayer(client.id);

        if (!sender) return;

        const { roomId } = sender;

        client.emit('messageSent', { messageId: v4(), message: data.message });
        client
            .to(roomId)
            .emit('receiveMessage', { senderId, message: data.message });
    }

    // -----------------------------------------------------------

    afterInit() {
        this.logger.debug('GameGateway Initialized!!');
    }

    handleConnection(client: TypedSocket) {
        this.logger.log(`Connected new client to Zone: ${client.id}`);
    }

    handleDisconnect(client: TypedSocket) {
        const player = this.zoneService.getPlayer(client.id);
        if (!player) return;

        const { roomId } = player;
        client.leave(roomId);
        this.zoneService.leaveRoom(roomId, client.id);
        client.to(roomId).emit('playerLeft', { id: player.id });
        this.logger.debug(`Cliend id from Zone:${client.id} disconnected`);
    }
}
