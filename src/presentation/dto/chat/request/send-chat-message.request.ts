import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class SendChatMessageRequest {
    @ApiProperty({
        description: '메시지',
        example: '안녕하세요',
    })
    @Length(1, 200)
    readonly message: string;
}
