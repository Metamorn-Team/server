import { Inject, Injectable } from '@nestjs/common';
import { ChatMessageWriter } from 'src/domain/components/chat-message/chat-message-writer';
import { ChatMessageEntity } from 'src/domain/entities/chat-messages/chat-message.entity';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { v4 } from 'uuid';

@Injectable()
export class ChatMessageService {
    constructor(
        @Inject(PlayerStorage)
        private readonly gameStorage: PlayerStorage,
        private readonly chatMessageWriter: ChatMessageWriter,
    ) {}

    async sendMessage(senderId: string, message: string) {
        const player = await this.gameStorage.getPlayer(senderId);
        if (!player) throw new Error('없는 플레이어');

        const { roomId } = player;
        await this.create(senderId, roomId, message, 'island');

        player.updateLastActivity();

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
