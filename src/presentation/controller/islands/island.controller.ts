import { Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { GetIslandDetailResponse } from 'src/presentation/dto/island/response/get-island-detail.response';

@LivislandController('islands')
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
