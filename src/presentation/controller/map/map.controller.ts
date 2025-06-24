import { Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { MapReader } from 'src/domain/components/map/map-reader';
import { toGetAllMapResponse } from 'src/presentation/converters/map-converters';
import { GetAllMapResponse } from 'src/presentation/dto/map/response/get-all-map.response';

@LivislandController('maps')
export class MapController {
    constructor(private readonly mapReader: MapReader) {}

    @ApiOperation({ summary: '모든 맵 조회' })
    @ApiResponse({
        status: 200,
        description: '모든 맵 조회 성공',
        type: GetAllMapResponse,
    })
    @Get()
    async getAll(): Promise<GetAllMapResponse> {
        const maps = await this.mapReader.readAll();
        return toGetAllMapResponse(maps);
    }
}
