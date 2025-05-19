import { Transactional } from '@nestjs-cls/transactional';
import { v4 } from 'uuid';
import { HttpStatus, Injectable } from '@nestjs/common';
import { GoldTransactionWrtier } from 'src/domain/components/gold-transactions/gold-transaction-writer';
import { ProductReader } from 'src/domain/components/products/product-reader';
import { PurchaseWriter } from 'src/domain/components/purchases/purchase-writer';
import { UserReader } from 'src/domain/components/users/user-reader';
import { UserWriter } from 'src/domain/components/users/user-writer';
import { GoldTransactionEntity } from 'src/domain/entities/gold-transaction/gold-transaction.entity';
import { PurchaseEntity } from 'src/domain/entities/purchase/purchase.entity';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import {
    NOT_ENOUGH_GOLD_MESSAGE,
    PRODUCT_NOT_FOUND_MESSAGE,
    PRODUCT_PURCHASE_LIMIT_EXCEEDED_MESSAGE,
} from 'src/domain/exceptions/message';
import { GoldTransactionTypeEnum } from 'src/domain/types/gold-transaction.types';
import { ProductForPurchase } from 'src/domain/types/product.types';
import { UserOwnedItemWriter } from 'src/domain/components/user-owned-items/user-owned-item-writer';
import { UserOwnedItemEntity } from 'src/domain/entities/user-owned-items/user-owned-item.entity';
import { PurchaseReader } from 'src/domain/components/purchases/purchase-reader';

@Injectable()
export class PurchaseService {
    constructor(
        private readonly userReader: UserReader,
        private readonly userWriter: UserWriter,
        private readonly productReader: ProductReader,
        private readonly purchaseReader: PurchaseReader,
        private readonly purchaseWriter: PurchaseWriter,
        private readonly goldTransactionWriter: GoldTransactionWrtier,
        private readonly userOwnedItemWriter: UserOwnedItemWriter,
    ) {}

    async purchase(buyerId: string, productIds: string[]) {
        const products = await this.productReader.readByIds(productIds);
        this.checkProductsExist(products, productIds);
        await this.checkIsPurchased(buyerId, productIds);

        const totalPrice = products.reduce((total, p) => total + p.price, 0);
        const goldBalance = await this.userReader.getGoldBalanceById(buyerId);

        const remainingGold = this.calculateGoldBalance(
            goldBalance,
            totalPrice,
        );

        const { purchases, goldTransaction, userOwnedItems } =
            this.generateEntities(buyerId, totalPrice, remainingGold, products);

        await this.purchaseTransaction(
            buyerId,
            remainingGold,
            goldTransaction,
            purchases,
            userOwnedItems,
        );
    }

    @Transactional()
    private async purchaseTransaction(
        userId: string,
        goldBalance: number,
        goldTransaction: GoldTransactionEntity,
        purchases: PurchaseEntity[],
        userOwnedItems: UserOwnedItemEntity[],
    ) {
        await Promise.all([
            this.purchaseWriter.createMany(purchases),
            this.goldTransactionWriter.create(goldTransaction),
            this.userWriter.updateGoldBalance(userId, goldBalance),
            this.userOwnedItemWriter.createMany(userOwnedItems),
        ]);
    }

    private generateEntities(
        buyerId: string,
        totalPrice: number,
        remainingGold: number,
        products: ProductForPurchase[],
    ) {
        const purchases = PurchaseEntity.createBulk(
            buyerId,
            products.map((p) => ({ goldAmount: p.price, productId: p.id })),
            v4,
        );

        const goldTransaction = GoldTransactionEntity.create(
            {
                userId: buyerId,
                type: GoldTransactionTypeEnum.PURCHASE,
                amount: totalPrice,
                balance: remainingGold,
                referenceIds: purchases.map((p) => p.id),
            },
            v4,
        );

        const userOwnedItems = UserOwnedItemEntity.createBulk(
            buyerId,
            products.map((p) => p.itemId),
            v4,
        );

        return { purchases, goldTransaction, userOwnedItems };
    }

    private checkProductsExist(
        products: ProductForPurchase[],
        productIds: string[],
    ) {
        const missingIds = productIds.filter(
            (productId) =>
                !products.some((product) => product.id === productId),
        );

        if (missingIds.length > 0) {
            throw new DomainException(
                DomainExceptionType.PRODUCT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                PRODUCT_NOT_FOUND_MESSAGE(JSON.stringify(missingIds)),
            );
        }
    }

    private calculateGoldBalance(goldBalance: number, totalPrice: number) {
        if (goldBalance < totalPrice) {
            throw new DomainException(
                DomainExceptionType.NOT_ENOUGH_GOLD,
                HttpStatus.UNPROCESSABLE_ENTITY,
                NOT_ENOUGH_GOLD_MESSAGE,
            );
        }

        return goldBalance - totalPrice;
    }

    private async checkIsPurchased(userId: string, productIds: string[]) {
        const has = await this.purchaseReader.hasAnyPurchased(
            userId,
            productIds,
        );
        if (has) {
            throw new DomainException(
                DomainExceptionType.PRODUCT_PURCHASE_LIMIT_EXCEEDED,
                HttpStatus.CONFLICT,
                PRODUCT_PURCHASE_LIMIT_EXCEEDED_MESSAGE,
            );
        }
    }
}
