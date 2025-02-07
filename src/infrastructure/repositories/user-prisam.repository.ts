import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/interface/user.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UserInfo } from 'src/domain/types/uesr.types';

@Injectable()
export class UserPrismaRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOneByEmail(email: string): Promise<UserInfo | null> {
        return await this.prisma.user.findUnique({
            select: {
                id: true,
                email: true,
                accountId: true,
                nickname: true,
                tag: true,
                provider: true,
            },
            where: {
                email,
            },
        });
    }
}
