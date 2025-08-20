import { Injectable } from '@nestjs/common';
import { ChatMessageWriter } from 'src/domain/components/chat-message/chat-message-writer';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { PlayerStorageWriter } from 'src/domain/components/users/player-storage-writer';

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
        const chatMessage = await this.chatMessageWriter.create({
            contextId: roomId,
            message,
            senderId,
            type: 'island',
        });
        await this.playerStorageWriter.updateLastActivity(senderId, Date.now());

        return {
            player,
            chatMessage,
        };
    }
}
