import { ApiProperty } from '@nestjs/swagger';

export class GetIslandDetailResponse {
    @ApiProperty({ example: 'uuid' })
    readonly id: string;

    @ApiProperty({ example: '섬입니다' })
    readonly name: string;

    @ApiProperty({ example: '설명입니다' })
    readonly description: string;

    @ApiProperty({ example: 5 })
    readonly maxMembers: number;

    @ApiProperty({ example: 'https://image.com' })
    readonly coverImage: string;

    @ApiProperty({ example: ['자유', '수다', '친목'] })
    readonly tags: string[];

    @ApiProperty()
    readonly owner: { id: string; nickname: string };
}
