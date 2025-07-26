import { LiveIsland } from 'src/domain/types/game.types';

export interface LivePrivateIsland extends LiveIsland {
    readonly ownerId: string;
    readonly urlPath: string;
    readonly name: string;
    readonly description: string | null;
    readonly isPublic: boolean;
    readonly coverImage: string | null;
    readonly password: string | null;
    readonly createdAt: Date;
}

export type CreateLivePrivateIsland = Omit<LivePrivateIsland, 'players'>;
