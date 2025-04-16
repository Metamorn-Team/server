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
import { FriendStatus } from 'src/domain/types/friend.types';
import {
    GetFriendRequestListRequest,
    GetFriendRequestsResponse,
} from 'src/presentation/dto/friends';
import { SendFriendRequest } from 'src/presentation/dto/friends/request/send-friend.request';

@ApiResponse({ status: 400, description: '잘못된 요청' })
@ApiResponse({ status: 401, description: '인증 실패 (토큰 누락 또는 만료)' })
@ApiBearerAuth()
@Controller('friends')
export class FriendsController {
    constructor(
        private readonly friendsService: FriendsService,
        private readonly friendWriter: FriendWriter,
    ) {}

    @ApiOperation({ summary: '친구 요청 전송' })
    @ApiResponse({ status: 204, description: '요청 성공' })
    @ApiResponse({ status: 404, description: '대상 사용자가 존재하지 않음' })
    @ApiResponse({ status: 409, description: '이미 친구 요청이 존재함' })
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
        description: '조회 성공. 상대방 사용자 정보가 user 필드에 포함됩니다.',
    })
    @UseGuards(AuthGuard)
    @Get('requests')
    async getFriendRequests(
        @CurrentUser() userId: string,
        @Query() dto: GetFriendRequestListRequest,
    ): Promise<GetFriendRequestsResponse> {
        const limit = dto.limit ?? 10;
        const { direction, cursor } = dto;

        return await this.friendsService.getFriendRequestList(
            userId,
            direction,
            limit,
            cursor,
        );
    }

    @ApiOperation({ summary: '친구 요청 수락' })
    @ApiResponse({ status: 204, description: '요청 수락 성공' })
    @ApiResponse({ status: 404, description: '친구 요청이 존재하지 않음' })
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('requests/:requestId/accept')
    async acceptFriendRequest(
        @CurrentUser() userId: string,
        @Param('requestId') requestId: string,
    ): Promise<void> {
        //? 컨트롤러에서 FriendStatus 도메인 타입 사용가능?
        const status: FriendStatus = 'ACCEPTED';
        await this.friendWriter.changeRequestStatus(userId, requestId, status);
    }

    @ApiOperation({ summary: '친구 요청 거절' })
    @ApiResponse({ status: 204, description: '요청 거절 성공' })
    @ApiResponse({ status: 404, description: '친구 요청이 존재하지 않음' })
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('requests/:requestId/reject')
    async rejectFriendRequest(
        @CurrentUser() userId: string,
        @Param('requestId') requestId: string,
    ): Promise<void> {
        const status: FriendStatus = 'REJECTED';
        await this.friendWriter.changeRequestStatus(userId, requestId, status);
    }
}
