import { LiveIsland } from 'src/domain/types/game.types';

export interface IslandReader {
    readOne(id: string): Promise<LiveIsland>;
    countPlayer(islandId: string): Promise<number>;
    getAllPlayer(islandId: string): Promise<string[]>;
}
