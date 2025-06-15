import { Body, Delete, Get, Param, ParseEnumPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { EquipmentReader } from 'src/domain/components/equipments/equipment-reader';
import { EquipmentService } from 'src/domain/services/equipments/equipement.service';
import { SlotType, slotTypes } from 'src/domain/types/equipment.types';
import { EquipRequest } from 'src/presentation/dto/equiptments/request/equip.request';
import { EquipmentStateResponse } from 'src/presentation/dto/equiptments/response/equipped-items.response';

@LivislandController('equipments')
export class EquipmentController {
    constructor(
        private readonly equipmentReader: EquipmentReader,
        private readonly equipmentsService: EquipmentService,
    ) {}

    @ApiOperation({
        summary: '아이템 장착',
        description: '정해져 있는 슬롯에 아이템을 장착할 수 있는 기능.',
    })
    @ApiResponse({ status: 404, description: '존재하지 않는 아이템일 경우' })
    @Post()
    async equipItem(@CurrentUser() userId: string, @Body() dto: EquipRequest) {
        const { itemId, slot } = dto;
        await this.equipmentsService.equipItem(userId, slot, itemId);
    }

    @ApiOperation({
        summary: '창작한 아이템 조회',
        description:
            '자신이 장착하고 있는 아이템을 조회하는 기능 (장착할 수 있는 최소한의 데이터).',
    })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: EquipmentStateResponse,
    })
    @Get('equipped')
    async getEquipped(
        @CurrentUser() userId: string,
    ): Promise<EquipmentStateResponse> {
        const equipmentState =
            await this.equipmentReader.readEquipmentState(userId);
        return { equipmentState };
    }

    @ApiOperation({
        summary: '창작한 아이템 해제',
        description: '자신이 장착하고 있는 아이템을 해제하는 기능',
    })
    @ApiResponse({
        status: 204,
        description: '해제 성공',
    })
    @Delete(':slot')
    async unequipItem(
        @CurrentUser() userId: string,
        @Param('slot', new ParseEnumPipe(slotTypes)) slot: SlotType,
    ) {
        await this.equipmentsService.unequipItem(userId, slot);
    }
}
