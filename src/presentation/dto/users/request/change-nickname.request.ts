import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class ChangeNicknameRequest {
    @ApiProperty()
    @Length(2, 20)
    readonly nickname: string;
}
