import { Player, PlayerWithEquippedItems } from 'src/domain/models/game/player';

export interface IslandManager {
    canJoin(islandId: string): Promise<boolean>;
    join(player: Player, password?: string): Promise<void>;
    getActiveUsers(
        islandId: string,
        myPlayerId: string,
    ): Promise<PlayerWithEquippedItems[]>;
    left(islandId: string, playerId: string): Promise<void>;
    handleLeave(
        player: Player,
    ): Promise<{ player: Player; ownerChanged?: boolean }>;
    removeEmpty(islandId: string): Promise<void>;
}
