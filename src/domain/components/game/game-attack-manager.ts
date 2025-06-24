import { Injectable } from '@nestjs/common';
import { CollidableObject } from 'src/domain/models/game/player';
import { Rectangle } from 'src/domain/types/game.types';
import { isColliding } from 'src/utils/game/collision';

// TODO 의존성 없어서 함수로 분리하고 굳이 주입 안 해도 될듯함.
@Injectable()
export class GameAttackManager {
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
}
