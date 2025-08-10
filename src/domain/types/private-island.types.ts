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

export const sortBy = ['createdAt'] as const;
export type SortBy = (typeof sortBy)[number];
export enum SortByEnum {
    createdAt = 'createdAt',
}

export type Order = 'asc' | 'desc';
export enum OrderEnum {
    asc = 'asc',
    desc = 'desc',
}
export interface GetPaginatedMyIslandsInput {
    userId: string;
    page: number;
    limit: number;
    sortBy: SortByEnum;
    order: OrderEnum;
}

export interface PrivateIsland {
    id: string;
    ownerId: string;
    urlPath: string;
    mapKey: string;
    name: string;
    isPublic: boolean;
    maxMembers: number;
    password: string | null;
    description: string | null;
    coverImage: string | null;
    createdAt: Date;
}

export interface PrivateIslandForCheckPassword {
    id: string;
    password: string | null;
}
