import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
    Kysely,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';
import kyselyExtension from 'prisma-extension-kysely';
import { DB } from '../../../prisma/generated/types';

declare module '@prisma/client' {
    interface PrismaClient {
        $kysely: Kysely<DB>;
    }
}

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    // constructor() {
    //     super({
    //         log: ['query'],
    //     });
    // }

    async onModuleInit() {
        const extension = this.$extends(
            kyselyExtension({
                kysely: (driver) =>
                    new Kysely<DB>({
                        dialect: {
                            createDriver: () => driver,
                            createAdapter: () => new PostgresAdapter(),
                            createIntrospector: (db) =>
                                new PostgresIntrospector(db),
                            createQueryCompiler: () =>
                                new PostgresQueryCompiler(),
                        },
                    }),
            }),
        );

        this.$kysely = extension.$kysely;
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
