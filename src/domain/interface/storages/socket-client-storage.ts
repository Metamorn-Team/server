export interface SocketClientStorage {
    getClientId(userId: string): string | null;
    setClientId(userId: string, clientId: string): void;
    removeClientId(userId: string): void;
    getAll(): { userId: string; clientId: string }[];
}

export const SocketClientStorage = Symbol('SocketClientStorage');
