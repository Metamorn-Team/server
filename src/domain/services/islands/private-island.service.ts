import { Injectable } from '@nestjs/common';
import { CreatePrivateIslandInput } from 'src/domain/types/island.types';
import { generateRandomBase62 } from 'src/utils/random';
import { PrivateIslandWriter } from 'src/domain/components/islands/private-island-writer';
import { PrivateIslandReader } from 'src/domain/components/islands/private-island-reader';
import { PRIVATE_ISLAND_MAX_MEMBERS } from 'src/common/constants';

@Injectable()
export class PrivateIslandService {
    constructor(
        private readonly privateIslandWriter: PrivateIslandWriter,
        private readonly privateIslandReader: PrivateIslandReader,
    ) {}

    async create(input: CreatePrivateIslandInput) {
        const urlPath = await this.generateUrlPath();
        const island = await this.privateIslandWriter.create({
            ...input,
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
