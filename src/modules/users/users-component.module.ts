import { Module } from '@nestjs/common';
import { UserChecker } from 'src/domain/components/users/user-checker';
import { UserReader } from 'src/domain/components/users/user-reader';
import { UserWriter } from 'src/domain/components/users/user-writer';
import { UserRepository } from 'src/domain/interface/user.repository';
import { UserPrismaRepository } from 'src/infrastructure/repositories/user-prisma.repository';

@Module({
    providers: [
        UserReader,
        UserWriter,
        UserChecker,
        { provide: UserRepository, useClass: UserPrismaRepository },
    ],
    exports: [UserReader, UserWriter, UserChecker],
})
export class UserComponentModule {}
