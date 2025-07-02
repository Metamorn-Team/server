import { WinstonModule } from 'nest-winston';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { windstonOptions } from 'src/configs/winston/winston-options';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-config';

export const COMMON_IMPORTS = [
    RedisModule,
    PrismaModule,
    ClsModule.forRoot(clsOptions),
    WinstonModule.forRoot(windstonOptions),
];
