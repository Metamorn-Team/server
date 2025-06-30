import { UseFilters, UseGuards, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
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
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { GameIslandCreateService } from 'src/domain/services/game/game-island-create.service';
import { GameIslandService } from 'src/domain/services/game/game-island.service';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import {
    ClientToLoby,
    CreateIslandRequest,
    GetLiveIslandListReqeust,
    LobyToClient,
} from 'src/presentation/dto';
import { CanJoinIslandRequest } from 'src/presentation/dto/game/request/can-join.request';
import { Logger } from 'winston';

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
    @WebSocketServer()
    private readonly wss: Namespace<ClientToLoby, LobyToClient>;

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        private readonly gameIslandCreateService: GameIslandCreateService,
        private readonly gameIslandService: GameIslandService,
        private readonly islandStorageReader: NormalIslandStorageReader,
    ) {}

    @SubscribeMessage('createIsland')
    async createIsland(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody(WsValidatePipe) data: CreateIslandRequest,
        @CurrentUserFromSocket() userId: string,
    ) {
        this.logger.debug(data);
        const { tags, ...rest } = data;
        const islandId = await this.gameIslandCreateService.create(
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
    async checkCanJoinIsland(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody(WsValidatePipe) data: CanJoinIslandRequest,
    ) {
        const response = await this.gameIslandService.checkCanJoin(
            data.islandId,
        );
        client.emit('canJoinIsland', response);
    }

    @SubscribeMessage('getActiveIslands')
    async getIslands(
        @ConnectedSocket() client: TypedSocket,
        @MessageBody(WsValidatePipe) data: GetLiveIslandListReqeust,
    ) {
        const islands = await this.islandStorageReader.readIslands(
            data.page,
            data.limit,
            data.tag,
        );
        client.emit('getActiveIslands', islands);
    }
}
