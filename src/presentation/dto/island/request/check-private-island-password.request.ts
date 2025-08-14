import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CheckPrivatePasswordRequest {
    @IsNotEmpty()
    @Length(1, 20)
    @IsString()
    @ApiProperty({
        description: '비밀번호',
        example: 'password123',
    })
    readonly password: string;
}
