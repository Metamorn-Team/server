import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { FriendWriter } from 'src/domain/components/friends/friend-writer';
import { FriendsService } from 'src/domain/services/friends/friends.service';
import {
    GetFriendRequestListRequest,
    GetFriendRequestsResponseDto,
} from 'src/presentation/dto/friends';
import { SendFriendRequest } from 'src/presentation/dto/friends/request/send-friend.request';

@Controller('friends')
export class FriendsController {
    constructor(
        private readonly friendsService: FriendsService,
        private readonly friendWriter: FriendWriter,
    ) {}

    @ApiOperation({ summary: '친구 요청 전송' })
    @ApiResponse({
        status: 204,
        description: '요청 성공',
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패 (토큰 누락 또는 만료)',
    })
    @ApiResponse({
        status: 404,
        description:
            '대상 사용자가 존재하지 않거나, 보낸 id와 받는 id가 동일함',
    })
    @ApiResponse({
        status: 409,
        description: '이미 친구 요청이 존재함',
    })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(AuthGuard)
    @Post('requests')
    async sendFriendRequest(
        @CurrentUser() userId: string,
        @Body() dto: SendFriendRequest,
    ): Promise<void> {
        await this.friendsService.sendFriendRequest(userId, dto.targetUserId);
    }

    @ApiOperation({
        summary: '친구 요청 목록 조회 (받은 요청 / 보낸 요청) - 페이지네이션',
    })
    @ApiResponse({
        status: 200,
        description:
            '조회 성공. 각 요청 항목에는 관련된 상대방 사용자 정보가 user 필드에 포함됩니다.', // 설명 업데이트
        type: GetFriendRequestsResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청 파라미터 (direction, limit, cursor)',
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패 (토큰 누락 또는 만료)',
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get('requests')
    async getFriendRequests(
        @CurrentUser() userId: string,
        @Query() dto: GetFriendRequestListRequest,
    ): Promise<GetFriendRequestsResponseDto> {
        const limit = dto.limit ?? 10;
        const { direction, cursor } = dto;

        return await this.friendsService.getFriendRequestList(
            userId,
            direction,
            limit,
            cursor,
        );
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('requests/:requestId')
    async acceptFriendRequest(
        @CurrentUser() userId: string,
        @Param('requestId') requestId: string,
    ): Promise<void> {
        await this.friendWriter.changeRequestStatusToAccept(userId, requestId);
    }
}
