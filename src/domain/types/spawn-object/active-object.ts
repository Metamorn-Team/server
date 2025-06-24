import { OBJECT_HIT_BOX } from 'src/constants/game/hit-box';
import { Rectangle } from 'src/domain/types/game.types';
import { gridToPosition } from 'src/utils/game/grid-to-position';

export type ObjectStatus = 'ALIVE' | 'DEAD';

export interface PersistentObjectPrototype {
    id: string;
    islandId: string;
    type: string;
    status: ObjectStatus;
    maxHp: number;
    respawnTime: number;
    x: number;
    y: number;
}

export class PersistentObject {
    readonly id: string;
    readonly islandId: string;
    readonly type: string;
    readonly status: ObjectStatus;
    readonly maxHp: number;
    readonly respawnTime: number;
    readonly x: number;
    readonly y: number;

    constructor(param: PersistentObjectPrototype) {
        Object.assign(this, {
            ...param,
            status: param.status || 'ALIVE',
        });
    }

    static fromSpawnZone(
        islandId: string,
        spawnZone: {
            spawnObject: {
                name: string;
                type: string;
                maxHp: number;
                respawnTime: number;
            };
            gridX: number;
            gridY: number;
        },
        idGen: () => string,
    ): PersistentObject {
        const { x, y } = gridToPosition(spawnZone.gridX, spawnZone.gridY);

        return new PersistentObject({
            id: idGen(),
            islandId,
            type: spawnZone.spawnObject.type,
            status: 'ALIVE',
            maxHp: spawnZone.spawnObject.maxHp,
            respawnTime: spawnZone.spawnObject.respawnTime,
            x,
            y,
        });
    }
}

export interface ActiveObjectPrototype {
    readonly id: string;
    readonly islandId: string;
    readonly type: string;
    readonly x: number;
    readonly y: number;
    respawnTime: number;
    hp: number;
}

export class ActiveObject {
    public readonly id: string;
    public readonly islandId: string;
    public readonly type: string;
    public readonly x: number;
    public readonly y: number;
    public respawnTime: number;
    public hp: number;

    constructor(param: ActiveObjectPrototype) {
        Object.assign(this, param);
    }

    static fromPersistentObject(
        persistentObject: PersistentObject,
    ): ActiveObject {
        return new ActiveObject({
            id: persistentObject.id,
            islandId: persistentObject.islandId,
            type: persistentObject.type,
            x: persistentObject.x,
            y: persistentObject.y,
            respawnTime: persistentObject.respawnTime,
            hp: persistentObject.maxHp,
        });
    }

    public getHitBox(): Rectangle {
        return {
            x: this.x,
            y:
                this.y -
                OBJECT_HIT_BOX[this.type as keyof typeof OBJECT_HIT_BOX]
                    .height /
                    2,
            width: OBJECT_HIT_BOX[this.type as keyof typeof OBJECT_HIT_BOX]
                .width,
            height: OBJECT_HIT_BOX[this.type as keyof typeof OBJECT_HIT_BOX]
                .height,
        };
    }
}
