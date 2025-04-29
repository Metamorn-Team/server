import { Logger, UseGuards } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { CurrentUserFromSocket } from 'src/common/decorator/current-user.decorator';
import { WsAuthGuard } from 'src/common/guard/ws-auth.guard';
import { ChatMessageService } from 'src/domain/services/chat-messages/chat-message.service';
import {
    ClientToServer,
    SendMessageRequest,
    ServerToClient,
    TypedSocket,
} from 'types';
import { v4 } from 'uuid';

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
    private readonly wss: Namespace<ClientToServer, ServerToClient>;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(private readonly chatMessageService: ChatMessageService) {}

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() data: SendMessageRequest,
        @ConnectedSocket() client: TypedSocket,
        @CurrentUserFromSocket() senderId: string,
    ) {
        try {
            const player = await this.chatMessageService.sendMessage(
                senderId,
                data.message,
            );

            client.emit('messageSent', {
                messageId: v4(),
                message: data.message,
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
}
