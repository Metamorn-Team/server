import { Injectable } from '@nestjs/common';
import { ChatMessageWriter } from 'src/domain/components/chat-message/chat-message-writer';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { PlayerStorageWriter } from 'src/domain/components/users/player-storage-writer';
import { ChatMessageEntity } from 'src/domain/entities/chat-messages/chat-message.entity';
import { v4 } from 'uuid';

@Injectable()
export class ChatMessageService {
    constructor(
        private readonly playerReader: PlayerStorageReader,
        private readonly chatMessageWriter: ChatMessageWriter,
        private readonly playerStorageWriter: PlayerStorageWriter,
    ) {}

    async sendMessage(senderId: string, message: string) {
        const player = await this.playerReader.readOne(senderId);

        const { roomId } = player;
        await this.create(senderId, roomId, message, 'island');
        await this.playerStorageWriter.updateLastActivity(senderId, Date.now());

        return player;
    }

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
