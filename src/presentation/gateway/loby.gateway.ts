import { Logger, UseGuards } from '@nestjs/common';
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { WsAuthGuard } from 'src/common/guard/ws-auth.guard';
import { WsValidatePipe } from 'src/common/pipe/ws-validate.pipe';
import { ClientToLoby, CreateIslandRequest, LobyToClient } from 'types';

type TypedSocket = Socket<ClientToLoby, LobyToClient>;

@UseGuards(WsAuthGuard)
@WebSocketGateway({
    path: '/game',
    namespace: 'loby',
    cors: {
        origin: true,
    },
})
export class LobyGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger(LobyGateway.name);

    @WebSocketServer()
    private readonly wss: Namespace<ClientToLoby, LobyToClient>;

    @SubscribeMessage('createIsland')
    createIsland(@MessageBody(WsValidatePipe) data: CreateIslandRequest) {
        this.logger.debug(data);
    }

    afterInit() {
        this.logger.debug('LobyGateway Initialized!!');
    }

    handleConnection(client: TypedSocket) {
        this.logger.log(`Connected new client to Loby: ${client.id}`);
    }

    handleDisconnect(client: TypedSocket) {
        this.logger.debug(
            `call disconnect id from Loby:${client.id} disconnected`,
        );
    }
}
