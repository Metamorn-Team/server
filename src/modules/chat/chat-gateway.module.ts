import { Module } from '@nestjs/common';
import { ChatMessageService } from 'src/domain/services/chat-messages/chat-message.service';
import { ChatMessageComponentModule } from 'src/modules/chat-messages/chat-message-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';
import { ChatGateway } from 'src/presentation/gateway/chat.gateway';

@Module({
    imports: [ChatMessageComponentModule, PlayerStorageComponentModule],
    providers: [ChatGateway, ChatMessageService],
    exports: [ChatGateway, ChatMessageService],
})
export class ChatGatewayModule {}
