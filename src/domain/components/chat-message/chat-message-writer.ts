import { Inject, Injectable } from '@nestjs/common';
import {
    ChatMessageEntity,
    ChatMessagePrototype,
} from 'src/domain/entities/chat-messages/chat-message.entity';
import { ChatMessageRepository } from 'src/domain/interface/chat-message.repository';
import { v4 } from 'uuid';

@Injectable()
export class ChatMessageWriter {
    constructor(
        @Inject(ChatMessageRepository)
        private readonly chatMessageRepository: ChatMessageRepository,
    ) {}

    async create(prototype: ChatMessagePrototype) {
        const chatMessage = ChatMessageEntity.create(prototype, v4);
        await this.chatMessageRepository.save(chatMessage);

        return chatMessage;
    }
}
