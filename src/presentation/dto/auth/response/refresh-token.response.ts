import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResponse {
    @ApiProperty({ description: '재발급 된 액세스 토큰(JWT)' })
    readonly accessToken: string;
}
