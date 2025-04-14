import { Injectable } from '@nestjs/common';
import { ChatMessageWriter } from 'src/domain/components/chat-message/chat-message-writer';
import { ChatMessageEntity } from 'src/domain/entities/chat-messages/chat-message.entity';
import { v4 } from 'uuid';

@Injectable()
export class ChatMessageService {
    constructor(private readonly chatMessageWriter: ChatMessageWriter) {}

    async create(
        senderId: string,
        contextId: string,
        message: string,
        type: string,
    ) {
        const stdDate = new Date();
        const chatMessage = ChatMessageEntity.create(
            { senderId, contextId, message, type },
            v4,
            stdDate,
        );

        await this.chatMessageWriter.create(chatMessage);
    }
}
