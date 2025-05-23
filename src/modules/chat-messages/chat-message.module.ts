import { Module } from '@nestjs/common';
import { ChatMessageService } from 'src/domain/services/chat-messages/chat-message.service';
import { ChatMessageComponentModule } from 'src/modules/chat-messages/chat-message-component.module';
import { PlayerStorageModule } from 'src/modules/game/player-storage.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';

@Module({
    imports: [
        PlayerStorageModule,
        ChatMessageComponentModule,
        PlayerStorageComponentModule,
    ],
    providers: [ChatMessageService],
    exports: [ChatMessageService],
})
export class ChatMessageModule {}
