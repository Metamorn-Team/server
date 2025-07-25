export const WsExceptions = {
    BAD_INPUT: 'BAD_INPUT',
    ISLAND_NOT_FOUND: 'ISLAND_NOT_FOUND',
    ISLAND_NOT_FOUND_IN_STORAGE: 'ISLAND_NOT_FOUND_IN_STORAGE',
    ISLAND_FULL: 'ISLAND_FULL',
    PLAYER_NOT_FOUND_IN_STORAGE: 'PLAYER_NOT_FOUND_IN_STORAGE',
    LOCK_ACQUIRED_FAILED: 'LOCK_ACQUIRED_FAILED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOO_MANY_PARTICIPANTS: 'TOO_MANY_PARTICIPANTS',
    UNKNOWN: 'UNKNOWN',
} as const;

export type WsExceptionsType = (typeof WsExceptions)[keyof typeof WsExceptions];
export type WsErrorBody = {
    name: WsExceptionsType;
    message: string;
};
