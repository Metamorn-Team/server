import { Controller, Get, Param, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { GetIslandDetailResponse } from 'src/presentation/dto/island/response/get-island-detail.response';

@ApiTags('islands')
@ApiResponse({ status: 400, description: '잘못된 요청' })
@ApiResponse({ status: 401, description: '인증 실패 (토큰 누락 또는 만료)' })
@ApiBearerAuth()
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
@Controller('islands')
export class IslandController {
    constructor(
        private readonly playerStorageReader: PlayerStorageReader,
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
    ) {}

    @ApiOperation({ summary: '섬 조회' })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: GetIslandDetailResponse,
    })
    @ApiResponse({ status: 404, description: '존재하지 않는 섬' })
    @Get(':id')
    async getIsland(@Param('id') id: string): Promise<GetIslandDetailResponse> {
        const island = await this.normalIslandStorageReader.readOne(id);
        const owner = await this.playerStorageReader.readOne(island.ownerId);

        return {
            coverImage: island.coverImage,
            description: island.description,
            id: island.id,
            maxMembers: island.max,
            name: island.name,
            tags: island.tags,
            owner: {
                id: owner.id,
                nickname: owner.nickname,
            },
        };
    }
}
