import { ActiveObject } from 'src/domain/types/spawn-object/active-object';

export class AttackedObject {
    readonly id: string;
    readonly status: string;

    constructor(param: { id: string; status: string }) {
        Object.assign(this, param);
    }

    static from(object: ActiveObject): AttackedObject {
        return new AttackedObject({
            id: object.id,
            status: object.status,
        });
    }
}

export class AttackObjectResponse {
    readonly attackerId: string;
    readonly attackedObjects: AttackedObject[];

    constructor(param: {
        attackerId: string;
        attackedObjects: AttackedObject[];
    }) {
        Object.assign(this, param);
    }

    static from(param: {
        attackerId: string;
        attackedObjects: ActiveObject[];
    }): AttackObjectResponse {
        return new AttackObjectResponse({
            attackerId: param.attackerId,
            attackedObjects: param.attackedObjects.map((object) =>
                AttackedObject.from(object),
            ),
        });
    }
}
