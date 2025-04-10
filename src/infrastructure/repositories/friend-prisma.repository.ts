import { Injectable } from '@nestjs/common';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { PrismaService } from '../prisma/prisma.service';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import {
    FriendData,
    ReceivedPaginatedFriendRequests,
    SentPaginatedFriendRequests,
} from 'src/domain/types/friend.types';

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

    async findReceivedRequestsByUserId(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<ReceivedPaginatedFriendRequests> {
        const cursorOption = cursor ? { id: cursor } : undefined;

        const requests = await this.prisma.friendRequest.findMany({
            select: { id: true, senderId: true, createdAt: true },
            where: { receiverId: userId, status: 'PENDING', deletedAt: null },
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
            take: limit + 1,
            cursor: cursorOption,
            skip: cursor ? 1 : 0,
        });

        let nextCursor: string | null = null;
        if (requests.length > limit) {
            const nextItem = requests.pop();
            nextCursor = nextItem?.id ?? null;
        }

        return { data: requests, nextCursor };
    }

    async findSentRequestsByUserId(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<SentPaginatedFriendRequests> {
        const cursorOption = cursor ? { id: cursor } : undefined;

        const requests = await this.prisma.friendRequest.findMany({
            select: { id: true, receiverId: true, createdAt: true },
            where: { senderId: userId, status: 'PENDING', deletedAt: null },
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
            take: limit + 1,
            cursor: cursorOption,
            skip: cursor ? 1 : 0,
        });

        let nextCursor: string | null = null;
        if (requests.length > limit) {
            const nextItem = requests.pop();
            nextCursor = nextItem?.id ?? null;
        }

        return { data: requests, nextCursor };
    }
}
