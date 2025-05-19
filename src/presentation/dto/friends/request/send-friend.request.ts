import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendFriendRequest {
    @ApiProperty({
        // ✅ ApiProperty 적용 확인
        description: '친구 요청을 보낼 대상 사용자의 ID (UUID)',
        example: 'f8dc4ae4-69a6-46ad-8b2d-239ec535ef8f', // 예시 추가 권장
    })
    @IsString()
    targetUserId: string;
}
