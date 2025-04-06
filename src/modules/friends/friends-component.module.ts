import { Module } from '@nestjs/common';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { FriendPrismaRepository } from 'src/infrastructure/repositories/friend-prisma.repository';

@Module({
    providers: [
        { provide: FriendRepository, useClass: FriendPrismaRepository },
    ],
})
export class FriendsComponentModule {}
