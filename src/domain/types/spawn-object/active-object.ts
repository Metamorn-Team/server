import { OBJECT_HIT_BOX } from 'src/constants/game/hit-box';
import { Rectangle } from 'src/domain/types/game.types';
import { SpawnZone } from 'src/domain/types/spawn-zone';
import { gridToPosition } from 'src/utils/game/grid-to-position';

export enum ObjectStatus {
    ALIVE = 'ALIVE',
    DEAD = 'DEAD',
}

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
            status: param.status || ObjectStatus.ALIVE,
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
            status: ObjectStatus.ALIVE,
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
    maxHp: number;
    status: ObjectStatus;
}

export class ActiveObject {
    public readonly id: string;
    public readonly islandId: string;
    public readonly type: string;
    public readonly x: number;
    public readonly y: number;
    public respawnTime: number;
    public maxHp: number;
    public hp: number;
    public status: ObjectStatus;

    constructor(param: ActiveObjectPrototype) {
        Object.assign(this, param);
    }

    static from(param: SpawnZone & { islandId: string }, idGen: () => string) {
        const { x, y } = gridToPosition(param.gridX, param.gridY);
        return new ActiveObject({
            id: idGen(),
            islandId: param.islandId,
            type: param.spawnObject.type,
            x,
            y,
            hp: param.spawnObject.maxHp,
            maxHp: param.spawnObject.maxHp,
            respawnTime: param.spawnObject.respawnTime,
            status: ObjectStatus.ALIVE,
        });
    }

    get hitBox(): Rectangle {
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

    public hit(damage: number) {
        this.hp -= damage;

        if (this.hp <= 0) {
            this.dead();
        }
    }

    public dead() {
        this.status = ObjectStatus.DEAD;
    }

    public revive() {
        this.status = ObjectStatus.ALIVE;
        this.hp = this.maxHp;
    }

    public isDead(): boolean {
        return this.status === ObjectStatus.DEAD;
    }
}
