import { Logger, UseFilters, UseGuards } from '@nestjs/common';
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
import { WsAuthGuard } from 'src/common/guard/ws-auth.guard';
import { WsValidatePipe } from 'src/common/pipe/ws-validate.pipe';
import { IslandReader } from 'src/domain/components/islands/island-reader';
import { IslandService } from 'src/domain/services/islands/island.service';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import {
    ClientToLoby,
    CreateIslandRequest,
    GetIslandListReqeust,
    LobyToClient,
} from 'src/presentation/dto';
import { CanJoinIslandRequest } from 'src/presentation/dto/game/request/can-join.request';

type TypedSocket = Socket<ClientToLoby, LobyToClient>;

@UseFilters(WsExceptionFilter)
@UseGuards(WsAuthGuard)
@WebSocketGateway({
    path: '/game',
    namespace: 'island',
    cors: {
        origin: true,
    },
})
export class LobyGateway {
    private readonly logger = new Logger(LobyGateway.name);

    @WebSocketServer()
    private readonly wss: Namespace<ClientToLoby, LobyToClient>;

    constructor(
        private readonly islandService: IslandService,
        private readonly islandReader: IslandReader,
    ) {}

    @SubscribeMessage('createIsland')
    async createIsland(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody(WsValidatePipe) data: CreateIslandRequest,
        @CurrentUserFromSocket() userId: string,
    ) {
        this.logger.debug(data);
        const { tags, ...rest } = data;
        const islandId = await this.islandService.create(
            {
                ...rest,
                ownerId: userId,
                type: IslandTypeEnum.NORMAL,
            },
            tags,
        );

        client.emit('createdIsland', { islandId });
    }

    @SubscribeMessage('canJoinIsland')
    checkCanJoinIsland(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody(WsValidatePipe) data: CanJoinIslandRequest,
    ) {
        const response = this.islandService.checkCanJoin(data.islandId);
        client.emit('canJoinIsland', response);
    }

    @SubscribeMessage('getActiveIslands')
    getIslands(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody(WsValidatePipe) data: GetIslandListReqeust,
    ) {
        const islands = this.islandReader.readLiveIsland(data.page, data.limit);
        client.emit('getActiveIslands', islands);
    }
}
