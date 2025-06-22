import { ActiveObject } from 'src/domain/types/spawn-object/active-object';

export class IslandActiveObject {
    constructor(
        readonly id: string,
        readonly type: string,
        readonly hp: number,
        readonly gX: number,
        readonly gY: number,
    ) {}

    static fromActiveObject(activeObject: ActiveObject): IslandActiveObject {
        return new IslandActiveObject(
            activeObject.id,
            activeObject.type,
            activeObject.hp,
            activeObject.gridX,
            activeObject.gridY,
        );
    }
}

export interface PlayerJoinSuccessResponse {
    readonly x: number;
    readonly y: number;
    readonly mapKey: string;
    readonly activeObjects: IslandActiveObject[];
}
