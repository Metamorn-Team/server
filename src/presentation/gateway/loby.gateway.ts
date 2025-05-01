import { Logger, UseGuards } from '@nestjs/common';
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
import { Namespace, Socket } from 'socket.io';
import { CurrentUserFromSocket } from 'src/common/decorator/current-user.decorator';
import { WsAuthGuard } from 'src/common/guard/ws-auth.guard';
import { WsValidatePipe } from 'src/common/pipe/ws-validate.pipe';
import { IslandService } from 'src/domain/services/islands/island.service';
import { IslandTypeEnum } from 'src/domain/types/island.types';
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

    constructor(private readonly islandService: IslandService) {}

    @SubscribeMessage('createIsland')
    async createIsland(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody(WsValidatePipe) data: CreateIslandRequest,
        @CurrentUserFromSocket() userId: string,
    ) {
        this.logger.debug(data);
        const islandId = await this.islandService.create({
            ...data,
            ownerId: userId,
            type: IslandTypeEnum.NORMAL,
        });

        client.emit('createdIsland', { islandId });
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
