import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/interface/user.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UserInfo } from 'src/domain/types/uesr.types';
import { UserEntity } from 'src/domain/entities/user/user.entity';

@Injectable()
export class UserPrismaRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(data: UserEntity): Promise<void> {
        await this.prisma.user.create({
            data,
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
}
