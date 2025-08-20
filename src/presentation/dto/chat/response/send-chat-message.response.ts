import { ApiProperty } from '@nestjs/swagger';

export class SendChatMessageResponse {
    @ApiProperty({
        description: '채팅 메시지 아이디',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: '채팅 메시지',
        example: '안녕하세요',
    })
    message: string;
}
