import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { ITEM_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { ItemRepository } from 'src/domain/interface/item.repository';

@Injectable()
export class ItemReader {
    constructor(
        @Inject(ItemRepository)
        private readonly itemRepository: ItemRepository,
    ) {}

    async assertExist(id: string) {
        const isExist = await this.itemRepository.existById(id);

        if (!isExist) {
            throw new DomainException(
                DomainExceptionType.ITEM_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                ITEM_NOT_FOUND_MESSAGE,
            );
        }
    }
}
