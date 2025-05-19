import { Module } from '@nestjs/common';
import { PurchaseService } from 'src/domain/services/purchases/purchase.service';
import { GoldTransactionComponentModule } from 'src/modules/gold-transactions/gold-transaction-component.module';
import { ProductComponentModule } from 'src/modules/products/product-component.module';
import { PurchaseComponentModule } from 'src/modules/purchases/purchase-component.module';
import { UserOwnedItemComponentModule } from 'src/modules/user-owned-items/user-owned-item-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';
import { PurchaseController } from 'src/presentation/controller/purchases/purchase.controller';

@Module({
    controllers: [PurchaseController],
    imports: [
        PurchaseComponentModule,
        UserComponentModule,
        ProductComponentModule,
        GoldTransactionComponentModule,
        UserOwnedItemComponentModule,
    ],
    providers: [PurchaseService],
    exports: [PurchaseService],
})
export class PurchaseModule {}
