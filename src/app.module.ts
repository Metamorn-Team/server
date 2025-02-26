import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { UserModule } from 'src/modules/users/users.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { FilterModule } from 'src/common/filter/filter.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        UserModule,
        AuthModule,
        FilterModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
