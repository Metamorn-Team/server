import {
    Body,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { EquipmentReader } from 'src/domain/components/equipments/equipment-reader';
import { UserReader } from 'src/domain/components/users/user-reader';
import { FriendsService } from 'src/domain/services/friends/friends.service';
import { UserService } from 'src/domain/services/users/users.service';
import { FriendRequestStatus } from 'src/domain/types/friend.types';
import { ChangeAvatarRequest } from 'src/presentation/dto/users/request/change-avatar.request';
import { ChangeBioRequest } from 'src/presentation/dto/users/request/change-bio.request';
import { ChangeNicknameRequest } from 'src/presentation/dto/users/request/change-nickname.request';
import { ChangeTagRequest } from 'src/presentation/dto/users/request/change-tag.request';
import { SearchUsersRequest } from 'src/presentation/dto/users/request/search-users.request';
import { GetGoldBalance } from 'src/presentation/dto/users/response/get-gold-balance';
import { GetMyResponse } from 'src/presentation/dto/users/response/get-me.response';
import { GetUserResponse } from 'src/presentation/dto/users/response/get-user.response';
import { SearchUserResponse } from 'src/presentation/dto/users/response/search-users.response';

@LivislandController('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userReader: UserReader,
        private readonly friendService: FriendsService,
        private readonly equipmentReader: EquipmentReader,
    ) {}

    @ApiOperation({
        summary: '유저 검색 (닉네임 또는 태그)',
        description:
            '닉네임 또는 태그를 기준으로 사용자를 검색합니다.(커서기반 페이지네이션)',
    })
    @ApiResponse({
        status: 200,
        description: '검색 성공',
        type: SearchUserResponse,
    })
    @Get('search')
    async searchUser(
        @CurrentUser() userId: string,
        @Query() query: SearchUsersRequest,
    ): Promise<SearchUserResponse> {
        const { search, varient, cursor, limit = 10 } = query;

        const paginatedUsers = await this.userReader.search(
            userId,
            search,
            varient,
            limit,
            cursor,
        );

        if (!paginatedUsers.data || paginatedUsers.data.length === 0) {
            return { data: [], nextCursor: null };
        }

        const targetUserIds = paginatedUsers.data.map((user) => user.id);

        const firendStatusesMap: Map<string, FriendRequestStatus> =
            await this.friendService.getFriendStatusesUsers(
                userId,
                targetUserIds,
            );

        const usersWithFriendStatus = paginatedUsers.data.map((user) => {
            const friendStatus = firendStatusesMap.get(user.id) || 'NONE';
            return { ...user, friendStatus };
        });

        return {
            data: usersWithFriendStatus,
            nextCursor: paginatedUsers.nextCursor,
        };
    }

    @ApiOperation({
        summary: '내 프로필 정보 조회',
        description: '로그인한 사용자의 프로필 정보를 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: GetMyResponse,
    })
    @ApiResponse({
        status: 404,
        description: '존재하지 않는 사용자 (access token 정보 오류)',
    })
    @Get('my')
    async getMyProfile(@CurrentUser() userId: string): Promise<GetMyResponse> {
        const profile = await this.userReader.readProfile(userId);
        const equipmentState =
            await this.equipmentReader.readEquipmentState(userId);

        return {
            ...profile,
            equipmentState,
        };
    }

    @ApiOperation({
        summary: '내 골드 잔액 조회',
        description: '로그인한 사용자의 골드 잔액을 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: GetGoldBalance,
    })
    @ApiResponse({
        status: 404,
        description: '존재하지 않는 사용자 (access token 정보 오류)',
    })
    @Get('gold')
    async getGoldBalance(
        @CurrentUser() userId: string,
    ): Promise<GetGoldBalance> {
        const goldBalance = await this.userReader.getGoldBalanceById(userId);
        return { goldBalance };
    }

    @ApiOperation({
        summary: '특정 유저 정보 조회',
        description:
            '사용자 ID를 이용하여 특정 사용자의 프로필 정보를 조회합니다.',
    })
    @ApiParam({
        name: 'id',
        description: '조회할 사용자 ID (UUID)',
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: GetUserResponse,
    })
    @ApiResponse({
        status: 400,
        description: '자신의 정보 조회시 BAD REQUEST 응답',
    })
    @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
    @Get(':id')
    async getUser(
        @CurrentUser() currentUserId: string,
        @Param('id') targetUserId: string,
    ): Promise<GetUserResponse> {
        const user = await this.userReader.readProfile(targetUserId);
        const friendStatus = await this.friendService.getFriendshipStatus(
            currentUserId,
            targetUserId,
        );

        return {
            ...user,
            friendStatus,
        };
    }

    @ApiOperation({
        summary: '닉네임 변경',
        description: '로그인한 사용자의 닉네임을 변경합니다.',
    })
    @ApiResponse({ status: 204, description: '닉네임 변경 성공 (No Content)' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('nickname')
    async changeNickname(
        @Body() dto: ChangeNicknameRequest,
        @CurrentUser() userId: string,
    ) {
        await this.userService.changeNickname(userId, dto.nickname);
    }

    @ApiOperation({
        summary: '태그 변경',
        description:
            '로그인한 사용자의 태그를 변경합니다. 태그는 고유해야 합니다.',
    })
    @ApiResponse({ status: 204, description: '태그 변경 성공 (No Content)' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('tag')
    async changeTag(
        @Body() dto: ChangeTagRequest,
        @CurrentUser() userId: string,
    ) {
        await this.userService.changeTag(userId, dto.tag);
    }

    @ApiOperation({
        summary: '아바타 변경',
        description: '로그인한 사용자의 아바타를 변경합니다.',
    })
    @ApiResponse({ status: 204, description: '아바타 변경 성공 (No Content)' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('avatar')
    async changeAvatar(
        @Body() dto: ChangeAvatarRequest,
        @CurrentUser() userId: string,
    ) {
        await this.userService.changeAvatar(userId, dto.avatarKey);
    }

    @ApiOperation({
        summary: '설명 변경',
        description: '로그인한 사용자의 설명을 변경합니다.',
    })
    @ApiResponse({ status: 204, description: '소개 변경 성공 (No Content)' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('bio')
    async changeBio(
        @Body() dto: ChangeBioRequest,
        @CurrentUser() userId: string,
    ) {
        await this.userService.changeBio(userId, dto.bio);
    }
}
