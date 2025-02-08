import { Module } from '@nestjs/common';
import { UserController } from 'src/presentation/user/user.controller';
import { UserService } from 'src/domain/services/user/user.service';
import { UserRepository } from 'src/domain/interface/user.repository';
import { UserPrismaRepository } from 'src/infrastructure/repositories/user-prisam.repository';

@Module({
    controllers: [UserController],
    providers: [
        UserService,
        { provide: UserRepository, useClass: UserPrismaRepository },
    ],
    exports: [{ provide: UserRepository, useClass: UserPrismaRepository }],
})
export class UserModule {}
