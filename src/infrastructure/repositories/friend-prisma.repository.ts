import { Injectable } from '@nestjs/common';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { PrismaService } from '../prisma/prisma.service';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import {
    FriendData,
    FriendInfo,
    FriendStatus,
    FriendWithRelationInfo,
    PaginatedFriendRequests,
    PaginatedFriends,
} from 'src/domain/types/friend.types';

@Injectable()
export class FriendPrismaRepository implements FriendRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(data: FriendEntity): Promise<void> {
        await this.prisma.friendRequest.create({
            data,
        });
    }

    async findFriendsByUserId(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedFriends> {
        const cursorOption = cursor ? { id: cursor } : undefined;

        const friendships = await this.prisma.friendRequest.findMany({
            where: {
                status: 'ACCEPTED',
                deletedAt: null,
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            select: {
                id: true,
                sender: {
                    select: {
                        id: true,
                        nickname: true,
                        tag: true,
                        avatarKey: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        nickname: true,
                        tag: true,
                        avatarKey: true,
                    },
                },
                updatedAt: true,
            },
            orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
            take: limit + 1,
            cursor: cursorOption,
        });

        let nextCursor: string | null = null;
        if (friendships.length > limit) {
            const nextItem = friendships.pop();
            nextCursor = nextItem?.id ?? null;
        }

        const maapedFriends: FriendWithRelationInfo[] = friendships.map(
            (fs) => {
                const friendUser =
                    fs.sender.id === userId ? fs.receiver : fs.sender;
                return {
                    friendshipId: fs.id,
                    friend: {
                        id: friendUser.id,
                        nickname: friendUser.nickname,
                        tag: friendUser.tag,
                        avatarKey: friendUser.avatarKey,
                    },
                    becameFriendAt: fs.updatedAt,
                };
            },
        );

        return { data: maapedFriends, nextCursor };
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
                status: {
                    not: 'REJECTED',
                },
                deletedAt: null,
            },
        });
    }

    async findReceivedRequestsByUserId(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedFriendRequests> {
        const cursorOption = cursor ? { id: cursor } : undefined;

        const requests = await this.prisma.friendRequest.findMany({
            select: {
                id: true,
                sender: {
                    select: {
                        id: true,
                        nickname: true,
                        tag: true,
                        avatarKey: true,
                    },
                },
                createdAt: true,
            },
            where: { receiverId: userId, status: 'PENDING', deletedAt: null },
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
            take: limit + 1,
            cursor: cursorOption,
        });

        let nextCursor: string | null = null;
        if (requests.length > limit) {
            const nextItem = requests.pop();
            nextCursor = nextItem?.id ?? null;
        }

        const mappedRequests = requests.map((request) => {
            return {
                id: request.id,
                user: request.sender as FriendInfo,
                createdAt: request.createdAt,
            };
        });

        return { data: mappedRequests, nextCursor };
    }

    async findSentRequestsByUserId(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedFriendRequests> {
        const cursorOption = cursor ? { id: cursor } : undefined;

        const requests = await this.prisma.friendRequest.findMany({
            select: {
                id: true,
                receiver: {
                    select: {
                        id: true,
                        nickname: true,
                        tag: true,
                        avatarKey: true,
                    },
                },
                createdAt: true,
            },
            where: { senderId: userId, status: 'PENDING', deletedAt: null },
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
            take: limit + 1,
            cursor: cursorOption,
        });

        let nextCursor: string | null = null;
        if (requests.length > limit) {
            const nextItem = requests.pop();
            nextCursor = nextItem?.id ?? null;
        }

        const mappedRequests = requests.map((request) => {
            return {
                id: request.id,
                user: request.receiver as FriendInfo,
                createdAt: request.createdAt,
            };
        });

        return { data: mappedRequests, nextCursor };
    }

    async findOneByIdAndStatus(
        userId: string,
        requestId: string,
        status: FriendStatus,
    ): Promise<FriendData | null> {
        return this.prisma.friendRequest.findFirst({
            where: {
                OR: [
                    {
                        id: requestId,
                        senderId: userId,
                        status: status,
                        deletedAt: null,
                    },
                    {
                        id: requestId,
                        receiverId: userId,
                        status: status,
                        deletedAt: null,
                    },
                ],
            },
            select: {
                id: true,
                senderId: true,
                receiverId: true,
                status: true,
            },
        });
    }

    async updateStatus(
        friendshipId: string,
        status: FriendStatus,
    ): Promise<void> {
        await this.prisma.friendRequest.update({
            where: { id: friendshipId },
            data: { status: status, updatedAt: new Date() },
        });
    }

    async deleteById(id: string): Promise<void> {
        await this.prisma.friendRequest.update({
            where: { id: id },
            data: {
                deletedAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    async countUnread(userId: string): Promise<number> {
        return await this.prisma.friendRequest.count({
            where: {
                receiverId: userId,
                isRead: false,
                deletedAt: null,
            },
        });
    }

    async updateIsRead(userId: string, isRead = true): Promise<void> {
        await this.prisma.friendRequest.updateMany({
            data: { isRead },
            where: {
                isRead: false,
                deletedAt: null,
            },
        });
    }
}
