import { Logger } from 'winston';
import { UseFilters, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Namespace, Socket } from 'socket.io';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketServer,
} from '@nestjs/websockets';
import { CurrentUserFromSocket } from 'src/common/decorator/current-user.decorator';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';
import { WsValidatePipe } from 'src/common/pipe/ws-validate.pipe';
import { IslandService } from 'src/domain/services/islands/island.service';
import { UpdateIslandInfoRequest } from 'src/presentation/dto/island/request/update-island-info.request';
import { ClientToIslandSettings, IslandSettingsToClient } from 'types';
import { LivislandGateway } from 'src/common/decorator/island-gateway.decorator';

type TypedSocket = Socket<ClientToIslandSettings, IslandSettingsToClient>;

@UseFilters(WsExceptionFilter)
@LivislandGateway()
export class IslandSettingsGateway {
    @WebSocketServer()
    private readonly wss: Namespace<
        ClientToIslandSettings,
        IslandSettingsToClient
    >;

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        private readonly islandService: IslandService,
    ) {}

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
