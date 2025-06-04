import { Inject, Injectable } from '@nestjs/common';
import { UserOwnedItemRepository } from 'src/domain/interface/user-owned-item.repository';
import {
    ItemGrade,
    ItemGradeEnum,
    ItemType,
    ItemTypeEnum,
} from 'src/domain/types/item.types';

@Injectable()
export class UserOwnedItemReader {
    constructor(
        @Inject(UserOwnedItemRepository)
        private readonly userOwnedItemRepository: UserOwnedItemRepository,
    ) {}

    async readAll(userId: string, type: ItemType, grade: ItemGrade) {
        return await this.userOwnedItemRepository.findAllByTypeAndGrade(
            userId,
            ItemTypeEnum[type],
            ItemGradeEnum[grade],
        );
    }
}
