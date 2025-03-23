import { Module } from '@nestjs/common';
import { GameGateway } from 'src/presentation/gateway/game.gateway';

@Module({
    providers: [GameGateway],
})
export class GameModule {}
