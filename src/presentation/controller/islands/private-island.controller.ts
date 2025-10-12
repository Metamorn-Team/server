import {
    Body,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { LivePrivateIslandReader } from 'src/domain/components/islands/live-private-island-reader';
import { PrivateIslandReader } from 'src/domain/components/islands/private-island-reader';
import { PrivateIslandService } from 'src/domain/services/islands/private-island.service';
import { OrderEnum, SortByEnum } from 'src/domain/types/private-island.types';
import { CheckPrivatePasswordRequest } from 'src/presentation/dto/island/request/check-private-island-password.request';
import { CreatePrivateIslandRequest } from 'src/presentation/dto/island/request/create-private-island.request';
import { GetMyPrivateIslandRequest } from 'src/presentation/dto/island/request/get-my-private-island.request';
import { GetPrivateIslandIdRequest } from 'src/presentation/dto/island/request/get-private-island-id.request';
import { CreatePrivateIslandResponse } from 'src/presentation/dto/island/response/create-private-island.response';
import { GetPrivateIslandIdResponse } from 'src/presentation/dto/island/response/get-private-island-id.response';
import { GetPrivateIslandListResponse } from 'src/presentation/dto/island/response/get-private-island-list.response';

@LivislandController('private-islands')
export class PrivateIslandController {
    constructor(
        private readonly friendIslandService: PrivateIslandService,
        private readonly privateIslandReader: PrivateIslandReader,
        private readonly livePrivateIslandReader: LivePrivateIslandReader,
        private readonly privateIslandService: PrivateIslandService,
    ) {}

    @ApiOperation({
        summary: '섬 생성',
        description: '섬 생성',
    })
    @ApiResponse({
        status: 200,
        description: '섬 생성 성공',
        type: CreatePrivateIslandResponse,
    })
    @HttpCode(200)
    @Post()
    async create(
        @Body() dto: CreatePrivateIslandRequest,
        @CurrentUser() userId: string,
    ): Promise<CreatePrivateIslandResponse> {
        return await this.friendIslandService.create({
            ...dto,
            ownerId: userId,
        });
    }

    @ApiOperation({
        summary: '내 섬 조회',
        description: '내 섬 조회 기능, offset 기반 pagination.',
    })
    @ApiResponse({
        status: 200,
        description: '섬 조회 성공',
        type: GetPrivateIslandListResponse,
    })
    @Get('my')
    async getMyIslands(
        @Query() dto: GetMyPrivateIslandRequest,
        @CurrentUser() userId: string,
    ): Promise<GetPrivateIslandListResponse> {
        const { sortBy, order } = dto;
        const islands = await this.privateIslandReader.readMyIslands({
            ...dto,
            userId,
            sortBy: SortByEnum[sortBy],
            order: OrderEnum[order],
        });
        const liveStatus =
            await this.livePrivateIslandReader.getIslandsLiveStatus(
                islands.map((i) => i.id),
            );
        const count = await this.privateIslandReader.countByOwner(userId);

        // TODO 컨버터 분리해도 될듯
        return {
            islands: islands.map((island) => ({
                ...island,
                isLive: liveStatus[island.id],
                createdAt: island.createdAt.toISOString(),
            })),
            count,
        };
    }

    @ApiOperation({
        summary: 'URL 경로로 섬 ID 조회 및 비밀번호 존재 유무 확인',
        description: 'URL 경로로 섬 ID 조회 및 비밀번호 존재 유무 확인',
    })
    @ApiResponse({
        status: 200,
        description: '섬 ID 조회 성공',
        type: GetPrivateIslandIdResponse,
    })
    @Get('id')
    async getId(
        @Query() dto: GetPrivateIslandIdRequest,
    ): Promise<GetPrivateIslandIdResponse> {
        return await this.privateIslandReader.readIdByUrlPath(dto.urlPath);
    }

    @ApiOperation({
        summary: '비밀번호 확인',
        description: '비밀번호 확인',
    })
    @ApiResponse({
        status: 204,
        description: '비밀번호 일치',
    })
    @ApiResponse({
        status: 403,
        description: '비밀번호 불일치',
    })
    @HttpCode(204)
    @Post(':id/password')
    async checkPassword(
        @Param('id') id: string,
        @Body() dto: CheckPrivatePasswordRequest,
    ): Promise<void> {
        return await this.privateIslandService.checkPassword(id, dto.password);
    }

    @ApiOperation({
        summary: '비밀섬 삭제',
        description: '비밀섬 삭제',
    })
    @ApiResponse({
        status: 204,
        description: '삭제 완료',
    })
    @ApiResponse({
        status: 403,
        description: '삭제 권한 없음',
    })
    @HttpCode(204)
    @Delete(':id')
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() userId: string,
    ) {
        await this.privateIslandService.remove(id, userId);
    }
}
