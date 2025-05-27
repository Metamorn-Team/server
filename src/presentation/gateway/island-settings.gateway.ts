import { Logger, UseFilters } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { CurrentUserFromSocket } from 'src/common/decorator/current-user.decorator';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';
import { WsValidatePipe } from 'src/common/pipe/ws-validate.pipe';
import { IslandService } from 'src/domain/services/islands/island.service';
import { UpdateIslandInfoRequest } from 'src/presentation/dto/island/request/update-island-info.request';
import { ClientToIslandSettings, IslandSettingsToClient } from 'types';

type TypedSocket = Socket<ClientToIslandSettings, IslandSettingsToClient>;

@UseFilters(WsExceptionFilter)
@WebSocketGateway({
    path: '/game',
    namespace: 'island',
    cors: {
        origin: true,
    },
})
export class IslandSettingsGateway {
    @WebSocketServer()
    private readonly wss: Namespace<
        ClientToIslandSettings,
        IslandSettingsToClient
    >;

    private readonly logger = new Logger(IslandSettingsGateway.name);

    constructor(private readonly islandService: IslandService) {}

    @SubscribeMessage('updateIslandInfo')
    async updateIslandInfo(
        @MessageBody(WsValidatePipe) data: UpdateIslandInfoRequest,
        @CurrentUserFromSocket() userId: string,
        @ConnectedSocket() _: TypedSocket,
    ) {
        const { id, ...input } = data;
        await this.islandService.update(id, userId, input);

        this.wss.to(id).emit('islandInfoUpdated', { islandId: id });
    }
}
