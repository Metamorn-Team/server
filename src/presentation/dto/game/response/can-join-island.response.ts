export interface CanJoinIslandResponse {
    readonly islandId?: string;
    readonly canJoin: boolean;
    readonly reason?: string;
}
