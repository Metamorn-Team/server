import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { TagReader } from 'src/domain/components/tags/tag-reader';
import { TagItem } from 'src/presentation/dto/tags/response/tag.response';

@ApiTags('tags')
@ApiResponse({ status: 400, description: '잘못된 요청 데이터 형식' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
@Controller('tags')
export class TagController {
    constructor(private readonly tagReader: TagReader) {}

    @ApiOperation({ summary: '태그 전체 조회' })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: [TagItem],
    })
    @Get('all')
    async getAll(): Promise<TagItem[]> {
        return await this.tagReader.readAll();
    }
}
