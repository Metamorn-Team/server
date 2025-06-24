export const DESERTED_ISLAND_KEY = (id: string) => `deserted-island:${id}`;

export const NORMAL_ISLAND_KEY = (id: string) => `normal-island:${id}`;
export const ISLAND_TAGS_KEY = (id: string) => `island-tags:${id}`;
export const ISLAND_PLAYERS_KEY = (id: string) => `island-players:${id}`;
export const ISLAND_LOCK_KEY = (id: string) => `island-lock:${id}`;

export const PLAYER_KEY = (id: string) => `player:${id}`;

export const RESPAWN_OBJECT_KEY = (islandId: string, objectId: string) =>
    `re-object:${islandId}:${objectId}`;
export const PERSISTENT_OBJECT_KEY = (islandId: string, objectId: string) =>
    `pe-object:${islandId}:${objectId}`;
