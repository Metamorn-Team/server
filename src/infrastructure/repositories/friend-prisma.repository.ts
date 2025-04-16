import { Injectable } from '@nestjs/common';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { PrismaService } from '../prisma/prisma.service';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import {
    FriendData,
    FriendInfo,
    FriendStatus,
    PaginatedFriendRequests,
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
            skip: cursor ? 1 : 0,
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
            skip: cursor ? 1 : 0,
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

    async updateRequestStatus(
        friendshipId: string,
        status: FriendStatus,
    ): Promise<void> {
        await this.prisma.friendRequest.update({
            where: { id: friendshipId },
            data: { status: status, updatedAt: new Date() },
        });
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

    async deleteById(id: string): Promise<void> {
        await this.prisma.friendRequest.update({
            where: { id: id },
            data: {
                deletedAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
}
