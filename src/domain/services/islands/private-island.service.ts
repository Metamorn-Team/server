import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePrivateIslandInput } from 'src/domain/types/island.types';
import { generateRandomBase62 } from 'src/utils/random';
import { PrivateIslandWriter } from 'src/domain/components/islands/private-island-writer';
import { PrivateIslandReader } from 'src/domain/components/islands/private-island-reader';
import { PRIVATE_ISLAND_MAX_MEMBERS } from 'src/common/constants';
import { MapReader } from 'src/domain/components/map/map-reader';
import { UserReader } from 'src/domain/components/users/user-reader';
import { PrivateIslandPasswordChecker } from 'src/domain/components/islands/private-storage/private-island-password-checker';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { FORBIDDEN_MESSAGE } from 'src/domain/exceptions/message';

@Injectable()
export class PrivateIslandService {
    constructor(
        private readonly privateIslandWriter: PrivateIslandWriter,
        private readonly privateIslandReader: PrivateIslandReader,
        private readonly mapReader: MapReader,
        private readonly userReader: UserReader,
        private readonly privateIslandPasswordChecker: PrivateIslandPasswordChecker,
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

    async checkPassword(id: string, password: string): Promise<void> {
        return await this.privateIslandPasswordChecker.checkPassword(
            id,
            password,
        );
    }

    async remove(id: string, userId: string, now = new Date()): Promise<void> {
        await this.checkOwnership(id, userId);
        await this.privateIslandWriter.delete(id, now);
    }

    async checkOwnership(islandId: string, userId: string): Promise<void> {
        const { ownerId } = await this.privateIslandReader.readOne(islandId);

        if (ownerId !== userId) {
            throw new DomainException(
                DomainExceptionType.FORBIDDEN,
                HttpStatus.FORBIDDEN,
                FORBIDDEN_MESSAGE,
            );
        }
    }
}
