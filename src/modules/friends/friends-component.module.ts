import { Module } from '@nestjs/common';
import { FriendsReader } from 'src/domain/components/friends/friend-reader';
import { FriendWriter } from 'src/domain/components/friends/friend-writer';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { FriendPrismaRepository } from 'src/infrastructure/repositories/friend-prisma.repository';

@Module({
    providers: [
        FriendsReader,
        FriendWriter,
        { provide: FriendRepository, useClass: FriendPrismaRepository },
    ],
    exports: [FriendsReader, FriendWriter],
})
export class FriendsComponentModule {}
