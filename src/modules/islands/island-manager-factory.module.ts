import { Module } from '@nestjs/common';
import { IslandManagerFactory } from 'src/domain/components/islands/factory/island-manager-factory';
import { DesertedIslandManagerModule } from 'src/modules/islands/deserted-island-manager.module';
import { NormalIslandManagerModule } from 'src/modules/islands/normal-island-manager.module';

@Module({
    imports: [NormalIslandManagerModule, DesertedIslandManagerModule],
    providers: [IslandManagerFactory],
    exports: [IslandManagerFactory],
})
export class IslandManagerFactoryModule {}
