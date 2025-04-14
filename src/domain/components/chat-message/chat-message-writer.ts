import { Inject, Injectable } from '@nestjs/common';
import { ChatMessageEntity } from 'src/domain/entities/chat-messages/chat-message.entity';
import { ChatMessageRepository } from 'src/domain/interface/chat-message.repository';

@Injectable()
export class ChatMessageWriter {
    constructor(
        @Inject(ChatMessageRepository)
        private readonly chatMessageRepository: ChatMessageRepository,
    ) {}

    async create(data: ChatMessageEntity) {
        await this.chatMessageRepository.save(data);
    }
}
