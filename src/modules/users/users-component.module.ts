import { Module } from '@nestjs/common';
import { UserChecker } from 'src/domain/components/users/user-checker.component';
import { UserReader } from 'src/domain/components/users/user-redear.component';
import { UserWriter } from 'src/domain/components/users/user-writer.component';
import { UserRepository } from 'src/domain/interface/user.repository';
import { UserPrismaRepository } from 'src/infrastructure/repositories/user-prisam.repository';

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
