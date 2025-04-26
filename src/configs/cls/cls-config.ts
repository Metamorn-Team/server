import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsModuleOptions } from 'nestjs-cls';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

export const clsOptions: ClsModuleOptions = {
    plugins: [
        new ClsPluginTransactional({
            imports: [PrismaModule],
            adapter: new TransactionalAdapterPrisma({
                prismaInjectionToken: PrismaService,
            }),
        }),
    ],
};
