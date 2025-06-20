import { ApiProperty } from '@nestjs/swagger';

export class MapItem {
    @ApiProperty({ example: 'uuid' })
    readonly id: string;

    @ApiProperty({
        description: '맵의 키값',
        example: 'town-island',
    })
    readonly key: string;

    @ApiProperty({ example: '평화로운 섬' })
    readonly name: string;

    @ApiProperty({ example: '평화로운 섬입니다.' })
    readonly description: string;

    @ApiProperty({ example: 'https://example.com/image.png' })
    readonly image: string;

    @ApiProperty({
        description: 'The created at of the map',
        example: '2021-01-01',
    })
    readonly createdAt: string;
}

export class GetAllMapResponse {
    @ApiProperty({ type: [MapItem] })
    readonly maps: MapItem[];
}
