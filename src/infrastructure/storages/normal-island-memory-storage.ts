// import { Injectable } from '@nestjs/common';
// import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
// import { DomainException } from 'src/domain/exceptions/exceptions';
// import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
// import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
// import { LiveNormalIsland } from 'src/domain/types/game.types';

// @Injectable()
// export class NormalIslandMemoryStorage implements NormalIslandStorage {
//     private normalIslands = new Map<string, LiveNormalIsland>();

//     createIsland(islandId: string, island: LiveNormalIsland): void {
//         this.normalIslands.set(islandId, island);
//     }

//     getIsland(islandId: string): LiveNormalIsland {
//         const island = this.normalIslands.get(islandId) ?? null;
//         if (!island)
//             throw new DomainException(
//                 DomainExceptionType.ISLAND_NOT_FOUND,
//                 1000,
//                 ISLAND_NOT_FOUND_MESSAGE,
//             );

//         return island;
//     }

//     getAllIsland(): LiveNormalIsland[] {
//         return Array.from(this.normalIslands.values());
//     }

//     countPlayer(islandId: string): number {
//         const island = this.normalIslands.get(islandId);
//         if (!island) {
//             throw new DomainException(
//                 DomainExceptionType.ISLAND_NOT_FOUND,
//                 1000,
//                 ISLAND_NOT_FOUND_MESSAGE,
//             );
//         }

//         return island.players.size;
//     }

//     addPlayerToIsland(islandId: string, playerId: string): void {
//         const island = this.normalIslands.get(islandId);
//         if (!island) {
//             throw new DomainException(
//                 DomainExceptionType.ISLAND_NOT_FOUND,
//                 1000,
//                 ISLAND_NOT_FOUND_MESSAGE,
//             );
//         }

//         island.players.add(playerId);
//     }

//     getIslandStore(): Record<string, LiveNormalIsland> {
//         return Object.fromEntries(this.normalIslands.entries());
//     }

//     getPlayerIdsByIslandId(islandId: string): string[] {
//         const island = this.normalIslands.get(islandId);
//         if (!island) {
//             throw new DomainException(
//                 DomainExceptionType.ISLAND_NOT_FOUND,
//                 1000,
//                 ISLAND_NOT_FOUND_MESSAGE,
//             );
//         }

//         return Array.from(island.players);
//     }

//     delete(islandId: string): void {
//         this.normalIslands.delete(islandId);
//     }
// }
