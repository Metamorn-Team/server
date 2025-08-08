import { Injectable } from '@nestjs/common';
import { CreatePrivateIslandInput } from 'src/domain/types/island.types';
import { generateRandomBase62 } from 'src/utils/random';
import { PrivateIslandWriter } from 'src/domain/components/islands/private-island-writer';
import { PrivateIslandReader } from 'src/domain/components/islands/private-island-reader';
import { PRIVATE_ISLAND_MAX_MEMBERS } from 'src/common/constants';
import { MapReader } from 'src/domain/components/map/map-reader';
import { UserReader } from 'src/domain/components/users/user-reader';

@Injectable()
export class PrivateIslandService {
    constructor(
        private readonly privateIslandWriter: PrivateIslandWriter,
        private readonly privateIslandReader: PrivateIslandReader,
        private readonly mapReader: MapReader,
        private readonly userReader: UserReader,
    ) {}

    async create(input: CreatePrivateIslandInput) {
        const { ownerId, mapKey, ...rest } = input;
        const user = await this.userReader.readProfile(ownerId);
        const map = await this.mapReader.readByKey(mapKey);

        const urlPath = await this.generateUrlPath();
        const island = await this.privateIslandWriter.create({
            ...rest,
            ownerId: user.id,
            mapId: map.id,
            urlPath,
            maxMembers: PRIVATE_ISLAND_MAX_MEMBERS,
        });

        return {
            id: island.id,
            urlPath,
        };
    }

    /**
     * 재귀적으로 중복되지 않는 urlPath 생성
     */
    async generateUrlPath(): Promise<string> {
        const path = generateRandomBase62(8);
        const exist = await this.privateIslandReader.existByUrlPath(path);
        if (exist) {
            return await this.generateUrlPath();
        }
        return path;
    }
}
