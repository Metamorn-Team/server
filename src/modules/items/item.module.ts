import { Module } from '@nestjs/common';
import { UserOwnedItemComponentModule } from 'src/modules/user-owned-items/user-owned-item-component.module';
import { ItemController } from 'src/presentation/controller/items/item.controller';

@Module({
    imports: [UserOwnedItemComponentModule],
    controllers: [ItemController],
})
export class ItemModule {}
