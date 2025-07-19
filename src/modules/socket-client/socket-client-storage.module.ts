import { Module } from '@nestjs/common';
import { SocketClientStorage } from 'src/domain/interface/storages/socket-client-storage';
import { SocketClientMemoryStorage } from 'src/infrastructure/storages/socket-client-memory-storage';

@Module({
    providers: [
        {
            provide: SocketClientStorage,
            useClass: SocketClientMemoryStorage,
        },
    ],
    exports: [SocketClientStorage],
})
export class SocketClientStorageModule {}
