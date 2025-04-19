import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Query,
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
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserReader } from 'src/domain/components/users/user-reader';
import { UserService } from 'src/domain/services/users/users.service';
import { ChangeAvatarRequest } from 'src/presentation/dto/users/request/change-avatar.request';
import { ChangeNicknameRequest } from 'src/presentation/dto/users/request/change-nickname.request';
import { ChangeTagRequest } from 'src/presentation/dto/users/request/change-tag.request';
import { SearchUsersRequest } from 'src/presentation/dto/users/request/search-users.request';
import { GetMyResponse } from 'src/presentation/dto/users/response/get-me.response';
import { GetUserResponse } from 'src/presentation/dto/users/response/get-user.response';
import { SearchUserResponse } from 'src/presentation/dto/users/response/search-users.response';

@ApiTags('users')
@ApiResponse({ status: 400, description: '잘못된 요청 데이터 형식' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userReader: UserReader,
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

        return await this.userReader.search(
            userId,
            search,
            varient,
            limit,
            cursor,
        );
    }

    @ApiOperation({
        summary: '내 프로필 정보 조회',
        description: '로그인한 사용자의 프로필 정보를 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: GetUserResponse,
    })
    @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
    @Get('my')
    async getMyProfile(@CurrentUser() userId: string): Promise<GetMyResponse> {
        return await this.userReader.readProfile(userId);
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
    @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
    @Get(':id')
    async getUser(@Param('id') userId: string): Promise<GetUserResponse> {
        return await this.userReader.readProfile(userId);
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
}
