import {
    Body,
    Controller,
    Delete,
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
import { FriendsService } from 'src/domain/services/friends/friends.service';
import {
    GetFriendRequestListRequest,
    GetFriendRequestsResponse,
    GetFriendsRequest,
    GetFriendsResponse,
} from 'src/presentation/dto/friends';
import { SendFriendRequest } from 'src/presentation/dto/friends/request/send-friend.request';

@ApiResponse({ status: 400, description: '잘못된 요청' })
@ApiResponse({ status: 401, description: '인증 실패 (토큰 누락 또는 만료)' })
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}

    @ApiOperation({ summary: '친구 요청 전송' })
    @ApiResponse({ status: 204, description: '요청 성공' })
    @ApiResponse({ status: 404, description: '대상 사용자가 존재하지 않음' })
    @ApiResponse({ status: 409, description: '이미 친구 요청이 존재함' })
    @HttpCode(HttpStatus.NO_CONTENT)
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
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('requests/:requestId/accept')
    async acceptFriendRequest(
        @CurrentUser() userId: string,
        @Param('requestId') requestId: string,
    ): Promise<void> {
        await this.friendsService.acceptFriend(userId, requestId);
    }

    @ApiOperation({ summary: '친구 요청 거절' })
    @ApiResponse({ status: 204, description: '요청 거절 성공' })
    @ApiResponse({ status: 404, description: '친구 요청이 존재하지 않음' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('requests/:requestId/reject')
    async rejectFriendRequest(
        @CurrentUser() userId: string,
        @Param('requestId') requestId: string,
    ): Promise<void> {
        await this.friendsService.rejectFriend(userId, requestId);
    }

    @ApiOperation({ summary: '친구 삭제' })
    @ApiResponse({ status: 204, description: '요청 성공' })
    @ApiResponse({ status: 404, description: '친구 관계가 존재하지 않음' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':friendshipId')
    async removeFriend(
        @CurrentUser() userId: string,
        @Param('friendshipId') friendshipId: string,
    ): Promise<void> {
        await this.friendsService.removeFriendship(userId, friendshipId);
    }

    @Get()
    async getFriends(
        @CurrentUser() userId: string,
        @Query() query: GetFriendsRequest,
    ): Promise<GetFriendsResponse> {
        const limit = query.limit ?? 20;
        const cursor = query.cursor;

        return await this.friendsService.getFriendsList(userId, limit, cursor);
    }
}
