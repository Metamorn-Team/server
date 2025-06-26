import { Injectable } from '@nestjs/common';
import { IslandActiveObjectReader } from 'src/domain/components/island-spawn-object/island-active-object-reader';
import { IslandActiveObjectWriter } from 'src/domain/components/island-spawn-object/island-active-object-writer';
import { CollidableObject, Player } from 'src/domain/models/game/player';
import { Rectangle } from 'src/domain/types/game.types';
import { ActiveObject } from 'src/domain/types/spawn-object/active-object';
import { isColliding } from 'src/utils/game/collision';

// TODO 의존성 없어서 함수로 분리하고 굳이 주입 안 해도 될듯함.
@Injectable()
export class GameAttackManager {
    constructor(
        private readonly islandActiveObjectReader: IslandActiveObjectReader,
        private readonly islandActiveObjectWriter: IslandActiveObjectWriter,
    ) {}

    findCollidingObjects(
        attackerId: string,
        attackRangeBox: Rectangle,
        objects: CollidableObject[],
    ) {
        return objects.reduce((acc, object) => {
            if (object.id === attackerId) return acc;

            if (isColliding(object.hitBox, attackRangeBox)) {
                acc.push(object);
            }
            return acc;
        }, [] as CollidableObject[]);
    }

    applyAttack(attacker: Player, attackedObjectIds: string[]): ActiveObject[] {
        const attackedObjects = this.islandActiveObjectReader.readByIds(
            attacker.roomId,
            attackedObjectIds,
        );

        attackedObjects.forEach((object) => {
            object.hit(attacker.damage);
            if (object.isDead()) {
                this.islandActiveObjectWriter.delete(
                    attacker.roomId,
                    object.id,
                );
            }
        });

        return attackedObjects;
    }
}
