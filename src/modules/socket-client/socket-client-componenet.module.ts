import { Module } from '@nestjs/common';
import { SocketClientReader } from 'src/domain/components/socket-client/socket-client-reader';
import { SocketClientWriter } from 'src/domain/components/socket-client/socket-client-writer';
import { SocketClientStorageModule } from 'src/modules/socket-client/socket-client-storage.module';

@Module({
    imports: [SocketClientStorageModule],
    providers: [SocketClientReader, SocketClientWriter],
    exports: [SocketClientReader, SocketClientWriter],
})
export class SocketClientComponentModule {}
