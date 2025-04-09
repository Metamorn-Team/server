import { Module } from '@nestjs/common';
import { ChatMessageService } from 'src/domain/services/chat-messages/chat-message.service';
import { ChatMessageComponentModule } from 'src/modules/chat-messages/chat-message-component.module';

@Module({
    imports: [ChatMessageComponentModule],
    providers: [ChatMessageService],
    exports: [ChatMessageService],
})
export class ChatMessageModule {}
