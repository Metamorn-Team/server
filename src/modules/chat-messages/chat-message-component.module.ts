import { Module } from '@nestjs/common';
import { ChatMessageWriter } from 'src/domain/components/chat-message/chat-message-writer';
import { ChatMessageRepository } from 'src/domain/interface/chat-message.repository';
import { ChatMessagePrismaRepository } from 'src/infrastructure/repositories/chat-message-prisma.repository';

@Module({
    providers: [
        ChatMessageWriter,
        {
            provide: ChatMessageRepository,
            useClass: ChatMessagePrismaRepository,
        },
    ],
    exports: [ChatMessageWriter],
})
export class ChatMessageComponentModule {}
