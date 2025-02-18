import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserService } from 'src/domain/services/user/user.service';
import { ChangeNicknameRequest } from 'src/presentation/dto/user/request/change-nickname.request';
import { ChangeTagRequest } from 'src/presentation/dto/user/request/change-tag.request';
import { SearchUserRequest } from 'src/presentation/dto/user/request/search-user.request';
import { SearchMyProfileResponse } from 'src/presentation/dto/user/response/search-my-profile.response';
import { SearchUserResponse } from 'src/presentation/dto/user/response/search-user.response';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard)
    @Get('search')
    async searchUser(
        @Query() dto: SearchUserRequest,
    ): Promise<SearchUserResponse> {
        return await this.userService.search(dto.searchUserId);
    }

    @UseGuards(AuthGuard)
    @Get('myProfile')
    async searchMyProfile(
        @CurrentUser() userId: string,
    ): Promise<SearchMyProfileResponse> {
        return await this.userService.searchMyProfile(userId);
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('nickname')
    async changeNickname(
        @Body() dto: ChangeNicknameRequest,
        @CurrentUser() userId: string,
    ) {
        await this.userService.updateNickname(userId, dto.nickname);
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('tag')
    async changeTag(
        @Body() dto: ChangeTagRequest,
        @CurrentUser() userId: string,
    ) {
        await this.userService.updateTag(userId, dto.tag);
    }
}
