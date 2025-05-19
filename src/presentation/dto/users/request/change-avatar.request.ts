import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class ChangeAvatarRequest {
    @ApiProperty({ example: 'blue_pawn', description: '아바타 키 값' })
    @Length(2, 30)
    readonly avatarKey: string;
}
