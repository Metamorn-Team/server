import { Inject, Injectable } from '@nestjs/common';
import { GoldTransactionEntity } from 'src/domain/entities/gold-transaction/gold-transaction.entity';
import {
    GoldTransactionRepositor,
    GoldTransactionRepository,
} from 'src/domain/interface/gold-transaction.repository';

@Injectable()
export class GoldTransactionWrtier {
    constructor(
        @Inject(GoldTransactionRepositor)
        private readonly goldTransactionRepositor: GoldTransactionRepository,
    ) {}

    async create(data: GoldTransactionEntity) {
        await this.goldTransactionRepositor.save(data);
    }
}
