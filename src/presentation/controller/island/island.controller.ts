import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IslandService } from 'src/domain/services/islands/island.service';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { CreateIslandRequest } from 'src/presentation/dto/island/create-island.request';

@ApiTags('islands')
@ApiResponse({ status: 400, description: '잘못된 요청 데이터 형식' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('islands')
export class IslandController {
    constructor(private readonly islandService: IslandService) {}

    @ApiOperation({ summary: '섬 생성' })
    @ApiResponse({
        status: 200,
        description: '섬 생성 성공',
    })
    @Post()
    async create(
        @Body() dto: CreateIslandRequest,
        @CurrentUser() userId: string,
    ) {
        await this.islandService.create({
            ...dto,
            ownerId: userId,
            type: IslandTypeEnum.NORMAL,
        });
    }
}
