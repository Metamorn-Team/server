import { Module } from '@nestjs/common';
import { FriendReader } from 'src/domain/components/friends/friend-reader';
import { FriendWriter } from 'src/domain/components/friends/friend-writer';
import { FriendChecker } from 'src/domain/components/friends/friend-checker';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { FriendPrismaRepository } from 'src/infrastructure/repositories/friend-prisma.repository';
import { UserReader } from 'src/domain/components/users/user-reader';

@Module({
    providers: [
        FriendReader,
        FriendWriter,
        FriendChecker,
        UserReader,
        { provide: FriendRepository, useClass: FriendPrismaRepository },
    ],
    exports: [FriendReader, FriendWriter, FriendChecker],
})
export class FriendsComponentModule {}
