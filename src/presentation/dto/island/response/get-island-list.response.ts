import { ApiProperty } from '@nestjs/swagger';

export class LiveIslandItem {
    @ApiProperty({ example: 'uuid' })
    readonly id: string;

    @ApiProperty({ example: 5, description: '최대 참여 가능 인원' })
    readonly maxMembers: number;

    @ApiProperty({ example: 3, description: '현재 참여 인원' })
    readonly countParticipants: number;

    @ApiProperty({ example: '멋진 섬' })
    readonly name: string;

    @ApiProperty({ example: '멋진 섬입니다' })
    readonly description: string;

    @ApiProperty({ example: 'https://island-image.com' })
    readonly coverImage: string;
}
