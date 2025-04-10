import { IsString } from 'class-validator';

export class SendFriendRequest {
    @IsString()
    targetUserId: string;
}
