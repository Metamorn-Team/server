import { Module } from '@nestjs/common';
import { ChatMessageService } from 'src/domain/services/chat-messages/chat-message.service';
import { ChatMessageComponentModule } from 'src/modules/chat-messages/chat-message-component.module';
import { GameStorageModule } from 'src/modules/game/game-storage.module';

@Module({
    imports: [GameStorageModule, ChatMessageComponentModule],
    providers: [ChatMessageService],
    exports: [ChatMessageService],
})
export class ChatMessageModule {}
