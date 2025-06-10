import { Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { PromotionReader } from 'src/domain/components/promotions/promotion-reader';
import { GetAllPromotionResponse } from 'src/presentation/dto/promotions/response/get-all-promotion.response';

@LivislandController('promotions')
export class PromotionController {
    constructor(private readonly promotionReader: PromotionReader) {}

    @ApiOperation({ description: '진행 중인 모든 프로모션 조회' })
    @ApiResponse({
        status: 200,
        description: '프로모션 조회 성공',
        type: [GetAllPromotionResponse],
    })
    @Get()
    async getAll(): Promise<GetAllPromotionResponse> {
        const promotions = await this.promotionReader.readAll();
        return { promotions };
    }
}
