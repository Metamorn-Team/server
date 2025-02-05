import { Injectable } from '@nestjs/common';
import { UserRepositoy } from 'src/domain/interface/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { UserInfo } from 'src/domain/types/uesr.types';

@Injectable()
export class UserPrismaRepository implements UserRepositoy {
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
