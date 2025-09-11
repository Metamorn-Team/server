import { ApiProperty } from '@nestjs/swagger';

export class TurnAuthResponse {
    @ApiProperty({ description: 'TURN 서버 사용자 이름' })
    readonly username: string;

    @ApiProperty({ description: 'TURN 서버 비밀번호' })
    readonly password: string;
}
