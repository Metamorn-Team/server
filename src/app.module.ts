import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { UserModule } from 'src/modules/users/users.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { FilterModule } from 'src/common/filter/filter.module';
import { InterceptorsModule } from 'src/common/interceptor/interceptors.module';
import { GameModule } from 'src/modules/game/game.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        InterceptorsModule,
        FilterModule,
        PrismaModule,
        UserModule,
        AuthModule,
        GameModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
