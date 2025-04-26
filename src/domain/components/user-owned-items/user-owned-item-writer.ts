import { Inject, Injectable } from '@nestjs/common';
import { UserOwnedItemEntity } from 'src/domain/entities/user-owned-items/user-owned-item.entity';
import { UserOwnedItemRepository } from 'src/domain/interface/user-owned-item.repository';

@Injectable()
export class UserOwnedItemWriter {
    constructor(
        @Inject(UserOwnedItemRepository)
        private readonly userOwnedItemRepository: UserOwnedItemRepository,
    ) {}

    async createMany(userOwnedItems: UserOwnedItemEntity[]) {
        await this.userOwnedItemRepository.saveMany(userOwnedItems);
    }
}
