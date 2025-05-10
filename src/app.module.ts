import { Module } from '@nestjs/common';
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
import { LoaderModule } from 'src/modules/loaders/Loader.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { validationSchema } from 'src/env-validation';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validationSchema }),
        ClsModule.forRoot(clsOptions),
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

        LoaderModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
