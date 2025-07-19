import { Inject, Injectable } from '@nestjs/common';
import { SocketClientStorage } from 'src/domain/interface/storages/socket-client-storage';

@Injectable()
export class SocketClientWriter {
    constructor(
        @Inject(SocketClientStorage)
        private readonly socketClientStorage: SocketClientStorage,
    ) {}

    addClientId(userId: string, clientId: string): void {
        this.socketClientStorage.setClientId(userId, clientId);
    }

    removeClientId(userId: string): void {
        this.socketClientStorage.removeClientId(userId);
    }
}
