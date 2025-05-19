import { ApiProperty } from '@nestjs/swagger';
import { FriendRequestStatus } from '../../shared';

export class CheckFriendshipResponse {
    @ApiProperty({
        example: 'SENT',
        enum: ['ACCEPTED', 'SENT', 'RECEIVED', 'NONE'],
    })
    readonly status: FriendRequestStatus;
}
