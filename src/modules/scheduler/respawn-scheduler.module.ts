import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RespawnScheduler } from 'src/domain/components/scheduler/respawn-scheduler';
import { IslandActiveObjectSpawnerModule } from 'src/modules/island-spawn-objects/island-active-object-spawner.module';

@Module({
    imports: [ScheduleModule.forRoot(), IslandActiveObjectSpawnerModule],
    providers: [RespawnScheduler],
    exports: [RespawnScheduler],
})
export class RespawnSchedulerModule {}
