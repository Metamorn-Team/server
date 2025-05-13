import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { FriendReader } from 'src/domain/components/friends/friend-reader';
import { FriendsService } from 'src/domain/services/friends/friends.service';
import {
    GetFriendRequestListRequest,
    GetFriendRequestsResponse,
    GetFriendsRequest,
    GetFriendsResponse,
} from 'src/presentation/dto/friends';
import { SendFriendRequest } from 'src/presentation/dto/friends/request/send-friend.request';
import { CheckFriendshipResponse } from 'src/presentation/dto/friends/response/check-friendship.response';
import { GetUnreadRequestResponse } from 'src/presentation/dto/friends/response/get-unread-request.response';

@ApiTags('friends')
@ApiResponse({ status: 400, description: '잘못된 요청' })
@ApiResponse({ status: 401, description: '인증 실패 (토큰 누락 또는 만료)' })
@ApiBearerAuth()
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
    constructor(
        private readonly friendsService: FriendsService,
        private readonly friendReader: FriendReader,
    ) {}

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
        type: GetFriendRequestsResponse,
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
    @ApiParam({
        name: 'requestId',
        description: '친구요청 ID(UUID)',
        example: '1af038aa-ad40-4b49-b484-2491681a813b',
    })
    @ApiResponse({ status: 204, description: '요청 수락 성공(no content)' })
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
    @ApiParam({
        name: 'requestId',
        description: '친구요청 ID(UUID)',
        example: '1af038aa-ad40-4b49-b484-2491681a813b',
    })
    @ApiResponse({ status: 204, description: '요청 거절 성공(no content)' })
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
    @ApiParam({
        name: 'friendshipId',
        description: '친구관계 ID(UUID)',
        example: '1af038aa-ad40-4b49-b484-2491681a813b',
    })
    @ApiResponse({ status: 204, description: '요청 성공(no content)' })
    @ApiResponse({ status: 404, description: '친구 관계가 존재하지 않음' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':friendshipId')
    async removeFriend(
        @CurrentUser() userId: string,
        @Param('friendshipId') friendshipId: string,
    ): Promise<void> {
        await this.friendsService.removeFriendship(userId, friendshipId);
    }

    @ApiOperation({ summary: '친구 여부 확인' })
    @ApiResponse({
        status: 200,
        description: '친구 여부 확인 성공',
        type: CheckFriendshipResponse,
    })
    @ApiResponse({ status: 404, description: '친구 관계가 존재하지 않음' })
    @HttpCode(HttpStatus.OK)
    @Get('check')
    async checkFriendship(
        @Query('targetId', ParseUUIDPipe) targetUserId: string,
        @CurrentUser() userId: string,
    ): Promise<CheckFriendshipResponse> {
        const status = await this.friendsService.getFriendshipStatus(
            userId,
            targetUserId,
        );
        return { status };
    }

    @ApiOperation({ summary: '친구 목록 조회' })
    @ApiResponse({
        status: 200,
        description: '친구 목록 정상 조회',
        type: GetFriendsResponse,
    })
    @Get()
    async getFriends(
        @CurrentUser() userId: string,
        @Query() query: GetFriendsRequest,
    ): Promise<GetFriendsResponse> {
        const limit = query.limit ?? 10;
        const cursor = query.cursor;

        return await this.friendsService.getFriendsList(userId, limit, cursor);
    }

    @ApiOperation({ summary: '확인하지 않은 친구 요청 개수 조회' })
    @ApiResponse({
        status: 200,
        description: '정상 조회',
        type: GetUnreadRequestResponse,
    })
    @Get('unread-count')
    async getUnreadCount(
        @CurrentUser() userId: string,
    ): Promise<GetUnreadRequestResponse> {
        const count = await this.friendReader.getUnreadCount(userId);
        return { count };
    }
}
