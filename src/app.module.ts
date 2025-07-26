import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { UserModule } from 'src/modules/users/users.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { InterceptorsModule } from 'src/common/interceptor/interceptors.module';
import { GameModule } from 'src/modules/game/game.module';
import { UserComponentModule } from './modules/users/users-component.module';
import { PipeModule } from './common/pipe/pipe.module';
import { FriendsModule } from './modules/friends/friends.module';
import { ProductCategoryModule } from 'src/modules/product-categories/product-category.module';
import { ProductModule } from 'src/modules/products/product.module';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-config';
import { PurchaseModule } from 'src/modules/purchases/purchase.module';
import { FileModule } from 'src/modules/files/file.module';
import { TagModule } from 'src/modules/tags/tag.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { validationSchema } from 'src/env-validation';
import { IslandModule } from 'src/modules/islands/island.module';
import { ItemModule } from 'src/modules/items/item.module';
import { EquipmentModule } from 'src/modules/equipments/equipment.module';
import { PromotionModule } from 'src/modules/promotions/promotion.module';
import { PromotionProductModule } from 'src/modules/promotion-product/promotion-product.module';
import { MapModule } from 'src/modules/map/map.module';
import { RespawnSchedulerModule } from 'src/modules/scheduler/respawn-scheduler.module';
import { LoaderModule } from 'src/modules/loaders/loader.module';
import { WinstonModule } from 'nest-winston';
import { windstonOptions } from 'src/configs/winston/winston-options';
import { AgentMiddleware } from 'src/common/middleware/agent.middleware';
import { ChatModule } from 'src/modules/chat/chat.module';
import { PrivateIslandModule } from 'src/modules/islands/private-island.module';

const onlyProdModules =
    process.env.NODE_ENV === 'test'
        ? []
        : [RespawnSchedulerModule, LoaderModule];

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validationSchema }),
        ClsModule.forRoot(clsOptions),
        WinstonModule.forRoot(windstonOptions),
        InterceptorsModule,
        PipeModule,
        PrismaModule,
        RedisModule,
        UserComponentModule,
        UserModule,
        AuthModule,
        GameModule,
        FriendsModule,
        ProductCategoryModule,
        ProductModule,
        PurchaseModule,
        FileModule,
        TagModule,
        IslandModule,
        PrivateIslandModule,
        ItemModule,
        EquipmentModule,
        PromotionModule,
        PromotionProductModule,
        MapModule,
        ChatModule,
        ...onlyProdModules,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AgentMiddleware).forRoutes('*');
    }
}
