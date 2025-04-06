import { Logger, UseGuards } from '@nestjs/common';
import { Namespace, Server, Socket } from 'socket.io';
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
import { ZoneService } from 'src/domain/services/game/zone.service';
import { UserReader } from 'src/domain/components/users/user-redear';
import { RoomType } from 'src/domain/types/game.types';

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
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { x: number; y: number; type: RoomType },
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
        const { type, x, y } = data;

        this.logger.log(`joined player : ${client.id}`);
        this.logger.debug(data);

        const availableRoom = this.zoneService.getAvailableRoom(type);

        const activeUsers =
            this.zoneService.getActiveUsers(availableRoom.id) || [];

        client.emit('activeUsers', activeUsers);

        const user = await this.userReader.readProfile(userId);
        this.logger.debug(user);

        const { id, nickname } = user;
        this.zoneService.joinRoom(availableRoom.id, client.id, {
            id,
            nickname,
            clientId: client.id,
            roomId: availableRoom.id,
            x,
            y,
        });

        client.join(availableRoom.id);
        client.to(availableRoom.id).emit('playerJoin', { ...user, x, y });
        this.zoneService.loggingStore(this.logger);
    }

    @SubscribeMessage('playerLeft')
    handlePlayerLeft(@ConnectedSocket() client: Socket) {
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
        @ConnectedSocket() client: Socket,
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

    // -----------------------------------------------------------

    afterInit() {
        this.logger.debug('GameGateway Initialized!!');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Connected new client to Zone: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const player = this.zoneService.getPlayer(client.id);
        if (!player) return;

        const { roomId } = player;
        client.leave(roomId);
        this.zoneService.leaveRoom(roomId, client.id);
        client.to(roomId).emit('playerLeft', { id: player.id });
        this.logger.debug(`Cliend id from Zone:${client.id} disconnected`);
    }
}
