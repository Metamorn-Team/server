import { Injectable } from '@nestjs/common';
import { FriendRepository } from 'src/domain/interface/friend.repository';

@Injectable()
export class FriendPrismaRepository implements FriendRepository {}
