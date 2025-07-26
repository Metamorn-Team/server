import { Inject, UseFilters, UseGuards } from '@nestjs/common';
import { Logger } from 'winston';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Namespace, Socket } from 'socket.io';
import { CurrentUserFromSocket } from 'src/common/decorator/current-user.decorator';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';
import { WsAuthGuard } from 'src/common/guard/ws-auth.guard';
import { ChatMessageService } from 'src/domain/services/chat-messages/chat-message.service';
import { ChatToClient, ClientToChat, SendMessageRequest } from 'types';
import { Player } from 'src/domain/models/game/player';

type TypedSocket = Socket<ClientToChat, ChatToClient>;

@UseFilters(WsExceptionFilter)
@UseGuards(WsAuthGuard)
@WebSocketGateway({
    path: '/game',
    namespace: 'island',
    cors: {
        origin: true,
    },
})
export class ChatGateway {
    @WebSocketServer()
    private readonly wss: Namespace<ClientToChat, ChatToClient>;

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        private readonly chatMessageService: ChatMessageService,
    ) {}

    // TODO chat controller 배포 후 제거
    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() data: SendMessageRequest,
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() senderId: string,
    ) {
        try {
            const { player, chatMessage } =
                await this.chatMessageService.sendMessage(
                    senderId,
                    data.message,
                );

            const { id: messageId, message } = chatMessage;
            client.emit('messageSent', {
                messageId,
                message,
            });
            client
                .to(player.roomId)
                .emit('receiveMessage', { senderId, message: data.message });

            this.logger.debug(`전송자: ${senderId}`);
            this.logger.debug(`메시지: ${data.message}`);
        } catch (e) {
            this.logger.error(`메세지 전송 실패: ${e as string}`);
        }
    }

    handleSendChatMessage(message: string, sender: Player) {
        const { id: senderId, roomId: contextId } = sender;
        this.wss.to(contextId).emit('receiveMessage', { senderId, message });

        this.logger.debug(`전송자: ${senderId}`);
        this.logger.debug(`메시지: ${message}`);
    }
}
