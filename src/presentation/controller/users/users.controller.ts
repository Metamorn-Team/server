import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserService } from 'src/domain/services/users/users.service';
import { ChangeNicknameRequest } from 'src/presentation/dto/users/request/change-nickname.request';
import { ChangeTagRequest } from 'src/presentation/dto/users/request/change-tag.request';
import { GetMeResponse } from 'src/presentation/dto/users/response/get-me.response';
import { GetUserResponse } from 'src/presentation/dto/users/response/get-user.response';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard)
    @Get('me')
    async getMe(@CurrentUser() userId: string): Promise<GetMeResponse> {
        console.log(userId);
        return await this.userService.getMe(userId);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getUser(@Param('id') userId: string): Promise<GetUserResponse> {
        return await this.userService.getUser(userId);
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
