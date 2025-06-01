import { Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { TagReader } from 'src/domain/components/tags/tag-reader';
import { TagItem } from 'src/presentation/dto/tags/response/tag.response';

@LivislandController('tags')
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
