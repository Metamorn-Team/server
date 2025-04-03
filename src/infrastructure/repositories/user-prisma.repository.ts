import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/interface/user.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { PaginatedUsers, UserInfo } from 'src/domain/types/uesr.types';
import { UserEntity } from 'src/domain/entities/user/user.entity';

@Injectable()
export class UserPrismaRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(data: UserEntity): Promise<void> {
        await this.prisma.user.create({
            data,
        });
    }

    async findOneById(searchUserId: string): Promise<UserInfo | null> {
        return await this.prisma.user.findUnique({
            select: {
                id: true,
                email: true,
                nickname: true,
                tag: true,
                provider: true,
            },
            where: {
                id: searchUserId,
            },
        });
    }

    async findOneByEmail(email: string): Promise<UserInfo | null> {
        return await this.prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                nickname: true,
                tag: true,
                provider: true,
            },
            where: {
                email: email,
                deletedAt: null,
            },
        });
    }

    async findOneByTag(tag: string): Promise<UserInfo | null> {
        return await this.prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                nickname: true,
                tag: true,
                provider: true,
            },
            where: {
                tag: tag,
                deletedAt: null,
            },
        });
    }

    async findManyByNickname(
        nickname: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedUsers> {
        const cursorOption = cursor ? { id: cursor } : undefined;

        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                nickname: true,
                tag: true,
                provider: true,
            },
            where: {
                nickname: {
                    startsWith: nickname,
                },
                deletedAt: null,
            },
            take: limit + 1,
            cursor: cursorOption,
            orderBy: [{ nickname: 'asc' }, { id: 'asc' }],
        });

        let nextCursor: string | undefined = undefined;
        if (users.length > limit) {
            const nextItem = users.pop();
            nextCursor = nextItem?.id;
        }

        return { users, nextCursor: nextCursor ?? null };
    }

    async findManyByTag(
        tag: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedUsers> {
        const cursorOption = cursor ? { id: cursor } : undefined;
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                nickname: true,
                tag: true,
                provider: true,
            },
            where: {
                tag: {
                    startsWith: tag,
                },
                deletedAt: null,
            },
            take: limit + 1,
            cursor: cursorOption,
            orderBy: [{ tag: 'asc' }, { id: 'asc' }],
        });

        let nextCursor: string | undefined = undefined;
        if (users.length > limit) {
            const nextItem = users.pop();
            nextCursor = nextItem?.id;
        }
        return { users, nextCursor: nextCursor ?? null };
    }

    async update(data: Partial<UserEntity>): Promise<void> {
        const { id, ...updateData } = data;
        await this.prisma.user.update({
            data: updateData,
            where: {
                id,
            },
        });
    }
}
