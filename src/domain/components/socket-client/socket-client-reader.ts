import { Inject, Injectable } from '@nestjs/common';
import { SocketClientStorage } from 'src/domain/interface/storages/socket-client-storage';

@Injectable()
export class SocketClientReader {
    constructor(
        @Inject(SocketClientStorage)
        private readonly socketClientStorage: SocketClientStorage,
    ) {}

    readClientId(userId: string): string | null {
        return this.socketClientStorage.getClientId(userId);
    }
}
