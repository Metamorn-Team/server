export type ObjectStatus = 'ALIVE' | 'DEAD';

export class PersistentObject {
    constructor(
        readonly id: string,
        readonly islandId: string,
        readonly type: string,
        readonly status: ObjectStatus,
        readonly maxHp: number,
        readonly respawnTime: number,
        readonly gridX: number,
        readonly gridY: number,
    ) {}

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
        return new PersistentObject(
            idGen(),
            islandId,
            spawnZone.spawnObject.type,
            'ALIVE',
            spawnZone.spawnObject.maxHp,
            spawnZone.spawnObject.respawnTime,
            spawnZone.gridX,
            spawnZone.gridY,
        );
    }
}

export class ActiveObject {
    constructor(
        public id: string,
        public islandId: string,
        public type: string,
        public respawnTime: number,
        public hp: number,
        public gridX: number,
        public gridY: number,
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
            persistentObject.gridX,
            persistentObject.gridY,
        );
    }
}
