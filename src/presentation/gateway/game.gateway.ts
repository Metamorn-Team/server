import { Logger } from '@nestjs/common';
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
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    namespace: 'game',
    cors: {
        origin: true,
    },
})
export class GameGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger(GameGateway.name);

    @WebSocketServer()
    private readonly server: Server;
    private players: {
        [playerId: string]: {
            x: number;
            y: number;
        };
    } = {};

    @SubscribeMessage('playerJoin')
    handlePlayerJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { x: number; y: number },
    ) {
        if (this.players[client.id]) return;

        this.logger.log(`joined player : ${client.id}`);
        this.logger.debug(this.players);
        this.logger.debug(data);

        client.emit('activeUsers', this.players);
        this.players[client.id] = {
            x: data.x,
            y: data.y,
        };

        client.broadcast.emit('playerJoin', {
            playerId: client.id,
        });
    }

    @SubscribeMessage('playerLeft')
    handlePlayerLeft(@ConnectedSocket() client: Socket) {
        if (!this.players[client.id]) return;

        delete this.players[client.id];
        this.logger.log(`Leave cilent: ${client.id}`);
        this.logger.debug(this.players);

        client.emit('playerLeft', { playerId: client.id });
    }

    @SubscribeMessage('playerMoved')
    handlePlayerMoved(
        @MessageBody() data: { x: number; y: number },
        @ConnectedSocket() client: Socket,
    ) {
        this.logger.log(`${client.id}: move to { x: ${data.x}, y: ${data.y} }`);

        this.players[client.id].x = data.x;
        this.players[client.id].y = data.y;
        this.server.emit('playerMoved', {
            playerId: client.id,
            x: data.x,
            y: data.y,
        });
    }

    // -----------------------------------------------------------

    afterInit() {
        this.logger.debug('GameGateway Initialized!!');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Connected new client: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        delete this.players[client.id];
        client.broadcast.emit('playerLeft', { playerId: client.id });
        this.logger.debug(`Cliend id:${client.id} disconnected`);
    }
}
