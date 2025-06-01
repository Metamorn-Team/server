import { Body, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { EquipmentService } from 'src/domain/services/equipments/equipement.service';
import { EquipRequest } from 'src/presentation/dto/equiptments/request/equip.request';

@LivislandController('equipments')
export class EquipmentController {
    constructor(private readonly equipmentsService: EquipmentService) {}

    @ApiOperation({ summary: '아이템 장착' })
    @ApiResponse({ status: 404, description: '존재하지 않는 아이템일 경우' })
    @Post()
    async equipItem(@CurrentUser() userId: string, @Body() dto: EquipRequest) {
        const { itemId, slot } = dto;
        await this.equipmentsService.equipItem(userId, slot, itemId);
    }
}
