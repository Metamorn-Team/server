import { EquipmentState } from 'src/domain/types/equipments/equiment-state';
import { IslandTypeEnum } from 'src/domain/types/island.types';

export interface PlayerPrototype {
    readonly id: string;
    readonly clientId: string;
    readonly nickname: string;
    readonly tag: string;
    readonly avatarKey: string;
    readonly roomId: string;
    readonly islandType: IslandTypeEnum;
    readonly x: number;
    readonly y: number;
    readonly radius: number;
    readonly isFacingRight?: boolean;
    readonly lastMoved?: number;
    readonly lastActivity?: number;
}

export class Player {
    constructor(
        public readonly id: string,
        public readonly clientId: string,
        public roomId: string,
        public islandType: IslandTypeEnum,
        public nickname: string,
        public tag: string,
        public avatarKey: string,
        public x: number,
        public y: number,
        public radius: number,
        public isFacingRight: boolean,
        public lastMoved: number,
        public lastActivity: number,
    ) {}

    static create(proto: PlayerPrototype) {
        const now = Date.now();

        return new Player(
            proto.id,
            proto.clientId,
            proto.roomId,
            proto.islandType,
            proto.nickname,
            proto.tag,
            proto.avatarKey,
            proto.x,
            proto.y,
            proto.radius,
            proto.isFacingRight || true,
            proto.lastMoved || now,
            proto.lastActivity || now,
        );
    }
}

export type PlayerWithEquippedItems = Player & {
    equipmentState: EquipmentState;
};
