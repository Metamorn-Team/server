export interface TransactionOption {
    execute: () => Promise<any>;
    rollback?: () => Promise<any>;
}

export interface TransactionManager {
    transaction(
        key: string,
        options: TransactionOption[],
        ttl?: number,
        maxRetries?: number,
        timeout?: number,
    ): Promise<void>;
}
