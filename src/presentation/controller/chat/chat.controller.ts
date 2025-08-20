import { Body, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { ChatMessageService } from 'src/domain/services/chat-messages/chat-message.service';
import { SendChatMessageRequest } from 'src/presentation/dto/chat/request/send-chat-message.request';
import { SendChatMessageResponse } from 'src/presentation/dto/chat/response/send-chat-message.response';
import { ChatGateway } from 'src/presentation/gateway/chat.gateway';

@LivislandController('chat')
export class ChatController {
    constructor(
        private readonly chatMessageService: ChatMessageService,
        private readonly chatGateway: ChatGateway,
    ) {}

    @ApiOperation({
        summary: '채팅 메시지 전송',
        description:
            '현재는 참여 중인 섬에 자동으로 전송, 추후 추가 파라미터로 전체 채팅 추가 가능성 있음.',
    })
    @ApiResponse({
        status: 200,
        description: '채팅 메시지 전송 성공',
        type: SendChatMessageResponse,
    })
    @HttpCode(200)
    @Post()
    async sendMessage(
        @Body() dto: SendChatMessageRequest,
        @CurrentUser() userId: string,
    ): Promise<SendChatMessageResponse> {
        const { message } = dto;
        const { player, chatMessage } =
            await this.chatMessageService.sendMessage(userId, message);
        this.chatGateway.handleSendChatMessage(message, player);

        return {
            id: chatMessage.id,
            message,
        };
    }
}
