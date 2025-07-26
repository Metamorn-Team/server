import { Module } from '@nestjs/common';
import { ChatGatewayModule } from 'src/modules/chat/chat-gateway.module';
import { ChatController } from 'src/presentation/controller/chat/chat.controller';

@Module({
    imports: [ChatGatewayModule],
    controllers: [ChatController],
})
export class ChatModule {}
