import { Body, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { PrivateIslandService } from 'src/domain/services/islands/private-island.service';
import { CreatePrivateIslandRequest } from 'src/presentation/dto/island/request/create-friend-island.request';
import { CreatePrivateIslandResponse } from 'src/presentation/dto/island/response/create-private-island.response';

@LivislandController('private-island')
export class PrivateIslandController {
    constructor(private readonly friendIslandService: PrivateIslandService) {}

    @ApiOperation({
        summary: '친구 섬 생성',
        description: '친구 섬 생성',
    })
    @ApiResponse({
        status: 200,
        description: '친구 섬 생성 성공',
        type: CreatePrivateIslandResponse,
    })
    @ApiResponse({
        status: 400,
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
}
