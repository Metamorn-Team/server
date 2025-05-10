import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PLAYER_NOT_FOUND_IN_STORAGE } from 'src/domain/exceptions/message';
import { Player } from 'src/domain/models/game/player';
import { SocketClientId } from 'src/domain/types/game.types';

export class PlayerMemoryStorage {
    private players = new Map<SocketClientId, Player>();

    addPlayer(player: Player): void {
        this.players.set(player.id, player);
    }

    getPlayer(playerId: string): Player {
        const player = this.players.get(playerId);
        if (!player)
            throw new DomainException(
                DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE,
                1000,
                PLAYER_NOT_FOUND_IN_STORAGE,
            );

        return player;
    }

    getPlayerByClientId(clientId: string): Player {
        for (const player of this.players.values()) {
            if (player.clientId === clientId) {
                return player;
            }
        }

        throw new DomainException(
            DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE,
            1000,
            PLAYER_NOT_FOUND_IN_STORAGE,
        );
    }

    deletePlayer(playerId: string): void {
        this.players.delete(playerId);
    }

    getPlayerStore(): Record<string, Player> {
        return Object.fromEntries(this.players.entries());
    }
}
