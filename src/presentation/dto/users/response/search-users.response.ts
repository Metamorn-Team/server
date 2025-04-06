import { ApiProperty } from '@nestjs/swagger';
import { UserInfo } from 'src/domain/types/uesr.types';
import { GetUserResponse } from './get-user.response';
export class SearchUserResponse {
    @ApiProperty({
        description: '검색된 사용자 목록',
        type: () => GetUserResponse,
        isArray: true,
    })
    readonly data: UserInfo[];

    @ApiProperty({
        description: '다음 페이지 시작점 ID, 마지막 페이지인 경우 null',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true,
        required: false,
    })
    readonly nextCursor: string | null;
}
