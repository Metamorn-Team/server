import { ATTACK_BOX_SIZE } from 'src/constants/game/attack-box';
import { PLAYER_STATS } from 'src/constants/game/stats';
import { EquipmentState } from 'src/domain/types/equipments/equiment-state';
import { Circle, Rectangle } from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { random } from 'src/utils/random';

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
    readonly minDamage?: number;
    readonly maxDamage?: number;
}

export interface CollidableObject {
    readonly id: string;
    readonly hitBox: Circle | Rectangle;
}

export class Player {
    public readonly id: string;
    public readonly clientId: string;
    public roomId: string;
    public islandType: IslandTypeEnum;
    public nickname: string;
    public tag: string;
    public avatarKey: string;
    public x: number;
    public y: number;
    public radius: number;
    public isFacingRight: boolean;
    public lastMoved: number;
    public lastActivity: number;
    public minDamage = PLAYER_STATS.PAWN.MIN_DAMAGE;
    public maxDamage = PLAYER_STATS.PAWN.MAX_DAMAGE;

    constructor(param: PlayerPrototype, now = Date.now()) {
        Object.assign(this, {
            ...param,
            isFacingRight: param.isFacingRight || true,
            lastMoved: param.lastMoved || now,
            lastActivity: param.lastActivity || now,
        });
    }

    static create(proto: PlayerPrototype, now = Date.now()): Player {
        return new Player(proto, now);
    }

    get damage(): number {
        return random.between(this.minDamage, this.maxDamage);
    }

    public getHitBox(): Circle {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius,
        };
    }

    public getAttackBox(): Rectangle {
        const boxSize = ATTACK_BOX_SIZE.PAWN;
        const attackBox = {
            x: this.isFacingRight
                ? this.x + boxSize.width / 2
                : this.x - boxSize.width / 2,
            y: this.y,
            width: boxSize.width,
            height: boxSize.height,
        };

        return attackBox;
    }
}

export type PlayerWithEquippedItems = Player & {
    equipmentState: EquipmentState;
};
