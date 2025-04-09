import { Injectable } from '@nestjs/common';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { PrismaService } from '../prisma/prisma.service';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';

@Injectable()
export class FriendPrismaRepository implements FriendRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(data: FriendEntity): Promise<void> {
        await this.prisma.friendRequest.create({
            data,
        });
    }
}
