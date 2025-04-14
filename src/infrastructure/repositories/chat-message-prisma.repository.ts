import { Injectable } from '@nestjs/common';
import { ChatMessageEntity } from 'src/domain/entities/chat-messages/chat-message.entity';
import { ChatMessageRepository } from 'src/domain/interface/chat-message.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class ChatMessagePrismaRepository implements ChatMessageRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(data: ChatMessageEntity): Promise<void> {
        await this.prisma.chatMessage.create({ data });
    }
}
