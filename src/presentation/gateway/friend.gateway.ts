import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import {
    ClientToFriend,
    FriendToClient,
} from 'src/presentation/dto/game/socket/type';
import { SendFriendRequest } from 'src/presentation/dto/friends';
import { CurrentUserFromSocket } from 'src/common/decorator/current-user.decorator';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';
import { WsAuthGuard } from 'src/common/guard/ws-auth.guard';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { FriendsService } from 'src/domain/services/friends/friends.service';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';

type TypedSocket = Socket<ClientToFriend, FriendToClient>;

@UseFilters(WsExceptionFilter)
@UseGuards(WsAuthGuard)
@WebSocketGateway({
    path: '/game',
    namespace: 'island',
    cors: {
        origin: true,
    },
})
export class FriendGateway {
    @WebSocketServer()
    private readonly wss: Namespace<ClientToFriend, FriendToClient>;

    private readonly logger = new Logger(FriendGateway.name);

    constructor(
        private readonly friendService: FriendsService,
        private readonly playerStorageReader: PlayerStorageReader,
    ) {}

    @SubscribeMessage('sendFriendRequest')
    async handleSendMessage(
        @MessageBody() data: SendFriendRequest,
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() senderId: string,
    ) {
        try {
            const { targetUserId } = data;
            await this.friendService.sendFriendRequest(senderId, targetUserId);

            client.emit('sendFriendRequestSuccess', { targetUserId });

            const player = await this.playerStorageReader.readOne(targetUserId);
            if (player) {
                const client = this.wss.sockets.get(player.clientId);
                client?.emit('receiveFriendRequest');
            }
        } catch (e) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE
            ) {
                return;
            }
            throw e;
        }
    }
}
