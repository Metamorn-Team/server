import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/interface/user.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { PaginatedUsers, UserInfo } from 'src/domain/types/uesr.types';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { toKyselyUuid } from 'test/unit/utils/to-kysely-uuid';

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
                avatarKey: true,
                bio: true,
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
                avatarKey: true,
                bio: true,
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
                avatarKey: true,
                bio: true,
            },
            where: {
                tag: tag,
                deletedAt: null,
            },
        });
    }

    async findStartWithNickname(
        currentUserId: string,
        nickname: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedUsers> {
        const cursorOption = cursor ? { id: cursor } : undefined;

        const data = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                nickname: true,
                tag: true,
                provider: true,
                avatarKey: true,
                bio: true,
            },
            where: {
                id: {
                    not: currentUserId,
                },
                nickname: {
                    startsWith: nickname,
                },
                deletedAt: null,
            },
            take: limit + 1,
            cursor: cursorOption,
            orderBy: [{ nickname: 'asc' }, { id: 'asc' }],
        });

        let nextCursor: string | null = null;
        if (data.length > limit) {
            const nextItem = data.pop();
            nextCursor = nextItem?.id ?? null;
        }

        return { data, nextCursor };
    }

    async findStartWithTag(
        currentUserId: string,
        tag: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedUsers> {
        const cursorOption = cursor ? { id: cursor } : undefined;
        const data = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                nickname: true,
                tag: true,
                provider: true,
                avatarKey: true,
                bio: true,
            },
            where: {
                id: {
                    not: currentUserId,
                },
                tag: {
                    startsWith: tag,
                },
                deletedAt: null,
            },
            take: limit + 1,
            cursor: cursorOption,
            orderBy: [{ tag: 'asc' }, { id: 'asc' }],
        });

        let nextCursor: string | null = null;
        if (data.length > limit) {
            const nextItem = data.pop();
            nextCursor = nextItem?.id ?? null;
        }
        return { data, nextCursor };
    }

    async findUserGoldById(id: string): Promise<{ gold: number } | null> {
        return await this.prisma.user.findUnique({
            select: {
                gold: true,
            },
            where: {
                id,
            },
        });
    }

    async findUserGoldByIdForUpdate(
        id: string,
    ): Promise<{ gold: number } | null> {
        const result = await this.prisma.$kysely
            .selectFrom('user')
            .select('gold')
            .forUpdate()
            .where('id', '=', toKyselyUuid(id))
            .executeTakeFirst();

        return result || null;
    }

    async update(id: string, data: Partial<UserEntity>): Promise<void> {
        const { nickname, tag, avatarKey, gold, bio } = data;

        await this.prisma.user.update({
            data: {
                nickname,
                tag,
                avatarKey,
                gold,
                bio,
            },
            where: {
                id,
            },
        });
    }
}
