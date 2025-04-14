import { ChatMessageEntity } from 'src/domain/entities/chat-messages/chat-message.entity';

export interface ChatMessageRepository {
    save(data: ChatMessageEntity): Promise<void>;
}

export const ChatMessageRepository = Symbol('ChatMessageRepository');
