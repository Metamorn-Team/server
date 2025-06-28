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

    findCollidingObjects<T extends CollidableObject>(
        attackerId: string,
        attackRangeBox: Rectangle,
        objects: T[],
    ) {
        return objects.reduce((acc, object) => {
            if (object.id === attackerId) return acc;

            if (isColliding(object.hitBox, attackRangeBox)) {
                acc.push(object);
            }
            return acc;
        }, [] as T[]);
    }

    applyAttack(
        attacker: Player,
        attackedObjects: ActiveObject[],
    ): ActiveObject[] {
        attackedObjects.forEach((object) => {
            if (!object.isDead()) {
                object.hit(attacker.damage);
            }
        });

        return attackedObjects;
    }
}
