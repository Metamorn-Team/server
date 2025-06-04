import { EquipmentState } from '../../../../domain/types/equipment.types';

export interface ActivePlayer {
    readonly id: string;
    readonly nickname: string;
    readonly tag: string;
    readonly avatarKey: string;
    readonly lastActivity: number;
    readonly x: number;
    readonly y: number;
    readonly equipmentState: EquipmentState;
}

export type ActivePlayerResponse = ActivePlayer[];
