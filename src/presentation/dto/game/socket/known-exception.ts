export const WsExceptions = {
    ISLAND_NOT_FOUND: 'ISLAND_NOT_FOUND',
    ISLAND_FULL: 'ISLAND_FULL',
    PLAYER_NOT_FOUND_IN_STORAGE: 'PLAYER_NOT_FOUND_IN_STORAGE',
    UNKNOWN: 'UNKNOWN',
} as const;

export type WsExceptionsType = (typeof WsExceptions)[keyof typeof WsExceptions];
