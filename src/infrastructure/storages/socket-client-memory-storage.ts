import { Injectable } from '@nestjs/common';
import { SocketClientStorage } from 'src/domain/interface/storages/socket-client-storage';

@Injectable()
export class SocketClientMemoryStorage implements SocketClientStorage {
    private readonly clientIdMap = new Map<string, string>();

    setClientId(userId: string, clientId: string): void {
        this.clientIdMap.set(userId, clientId);
    }

    getClientId(userId: string): string | null {
        return this.clientIdMap.get(userId) || null;
    }

    removeClientId(userId: string): void {
        this.clientIdMap.delete(userId);
    }
}
