import { Module } from '@nestjs/common';
import { PrivateIslandService } from 'src/domain/services/islands/private-island.service';
import { PrivateIslandController } from 'src/presentation/controller/islands/private-island.controller';
import { PrivateIslandComponentModule } from 'src/modules/islands/private-island-component.module';

@Module({
    imports: [PrivateIslandComponentModule],
    controllers: [PrivateIslandController],
    providers: [PrivateIslandService],
})
export class PrivateIslandModule {}
