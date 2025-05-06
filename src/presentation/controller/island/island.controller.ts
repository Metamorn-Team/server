import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IslandReader } from 'src/domain/components/islands/island-reader';
import { IslandService } from 'src/domain/services/islands/island.service';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { CreateIslandRequest } from 'src/presentation/dto/game/request/create-island.request';
import { GetIslandListReqeust } from 'src/presentation/dto/island/request/get-island-list.request';
import { LiveIslandItem } from 'src/presentation/dto/island/response/get-island-list.response';

@ApiTags('islands')
@ApiResponse({ status: 400, description: '잘못된 요청 데이터 형식' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
@Controller('islands')
export class IslandController {
    constructor(
        private readonly islandService: IslandService,
        private readonly islandReader: IslandReader,
    ) {}

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
        const { tags, ...rest } = dto;
        await this.islandService.create(
            {
                ...rest,
                ownerId: userId,
                type: IslandTypeEnum.NORMAL,
            },
            tags,
        );
    }

    @ApiOperation({ summary: '활성 상태의 섬 조회' })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: [LiveIslandItem],
    })
    @Get('active')
    getLiveIslands(@Query() dto: GetIslandListReqeust): LiveIslandItem[] {
        return this.islandReader.readLiveIsland(dto.page, dto.limit);
    }
}
