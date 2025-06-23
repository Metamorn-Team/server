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

export class ActiveObject {
    constructor(
        public readonly id: string,
        public readonly islandId: string,
        public readonly type: string,
        public respawnTime: number,
        public hp: number,
        public readonly x: number,
        public readonly y: number,
    ) {}

    static fromPersistentObject(
        persistentObject: PersistentObject,
    ): ActiveObject {
        return new ActiveObject(
            persistentObject.id,
            persistentObject.islandId,
            persistentObject.type,
            persistentObject.respawnTime,
            persistentObject.maxHp,
            persistentObject.x,
            persistentObject.y,
        );
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
