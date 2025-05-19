import { Injectable } from '@nestjs/common';
import { ATTACK_BOX_SIZE } from 'src/constants/game/attack-box';
import { PLAYER_HIT_BOX } from 'src/constants/game/hit-box';
import { PlayerMemoryStorageManager } from 'src/domain/components/users/player-memory-storage-manager';
import { Player } from 'src/domain/models/game/player';
import { Position, Rectangle } from 'src/domain/types/game.types';
import { isCircleInRect } from 'src/utils/game/collision';

@Injectable()
export class GameAttackManager {
    constructor(
        private readonly playerMemoryStorageManager: PlayerMemoryStorageManager,
    ) {}

    calcAttackRangeBox(attacker: Player) {
        // TODO 아바타 추가되면 avatarKey에 따라 분기
        // 공격 박스의 끝부분이 캐릭터 중심 좌표에 있음
        const boxSize = ATTACK_BOX_SIZE.PAWN;
        const attackBox = {
            x: attacker.isFacingRight
                ? attacker.x + boxSize.width / 2
                : attacker.x - boxSize.width / 2,
            y: attacker.y,
            width: boxSize.width,
            height: boxSize.height,
        };

        return attackBox;
    }

    findTargetsInBox(
        playerIds: string[],
        attackerId: string,
        attackRangeBox: Rectangle,
    ) {
        return playerIds.reduce((acc, playerId) => {
            if (playerId === attackerId) return acc;
            let player: Player;

            try {
                player = this.playerMemoryStorageManager.readOne(playerId);
            } catch (_) {
                return acc;
            }

            if (this.isInAttackBox(player, attackRangeBox)) {
                acc.push(player);
            }
            return acc;
        }, [] as Player[]);
    }

    isInAttackBox(targetPosition: Position, box: Rectangle) {
        // TODO 캐릭터 추가되면 상수로 관리
        const radius = PLAYER_HIT_BOX.PAWN.RADIUS;
        const isHit = isCircleInRect({ ...targetPosition, radius }, box);

        return isHit;
    }
}
