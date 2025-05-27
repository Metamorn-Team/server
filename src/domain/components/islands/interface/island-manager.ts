import { Player } from 'src/domain/models/game/player';

export interface IslandManager {
    canJoin(islandId: string): Promise<void>;
    join(player: Player): Promise<void>;
    getActiveUsers(islandId: string, myPlayerId: string): Promise<Player[]>;
    left(islandId: string, playerId: string): Promise<void>;
    handleLeave(player: Player): Promise<Player>;
    removeEmpty(islandId: string): Promise<void>;
}
