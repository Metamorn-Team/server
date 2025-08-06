import { ApiProperty } from '@nestjs/swagger';

export class PrivateIslandItem {
    @ApiProperty({ description: '섬 ID', example: 'uuid' })
    readonly id: string;

    @ApiProperty({ description: '섬 이름', example: '비밀의 섬' })
    readonly name: string;

    @ApiProperty({
        description: '섬 설명',
        example: '친구들과 함께 노는 비밀 공간',
        nullable: true,
    })
    readonly description: string | null;

    @ApiProperty({
        description: '섬 대표 이미지 URL',
        example: 'https://cdn.example.com/images/cover.png',
        nullable: true,
    })
    readonly coverImage: string | null;

    @ApiProperty({ description: '공개 여부', example: false })
    readonly isPublic: boolean;

    @ApiProperty({ description: '라이브 상태 여부 (Y 또는 N)', example: true })
    readonly isLive: boolean;

    @ApiProperty({
        description: '접속용 URL path',
        example: 'sTG2Awhf',
    })
    readonly urlPath: string;

    @ApiProperty({
        description: '최대 참여 가능 인원 수',
        example: 5,
    })
    readonly maxMembers: number;

    @ApiProperty({
        description: '생성일시 (ISO 8601)',
        example: '2025-07-27T14:00:00.000Z',
    })
    readonly createdAt: string;
}

export class GetPrivateIslandListResponse {
    @ApiProperty({ type: [PrivateIslandItem] })
    readonly islands: PrivateIslandItem[];

    @ApiProperty({ description: '전체 섬 개수', example: 10 })
    readonly count: number;
}
