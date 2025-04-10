import { Injectable } from '@nestjs/common';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { PrismaService } from '../prisma/prisma.service';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendData } from 'src/domain/types/friend.types';

@Injectable()
export class FriendPrismaRepository implements FriendRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(data: FriendEntity): Promise<void> {
        await this.prisma.friendRequest.create({
            data,
        });
    }

    async findRequestBetweenUsers(
        user1Id: string,
        user2Id: string,
    ): Promise<FriendData | null> {
        return this.prisma.friendRequest.findFirst({
            where: {
                OR: [
                    {
                        senderId: user1Id,
                        receiverId: user2Id,
                        deletedAt: null,
                    },
                    {
                        senderId: user2Id,
                        receiverId: user1Id,
                        deletedAt: null,
                    },
                ],
            },
        });
    }
}
