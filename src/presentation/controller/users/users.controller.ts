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
import { UserReader } from 'src/domain/components/users/user-redear.component';
import { UserService } from 'src/domain/services/users/users.service';
import { ChangeNicknameRequest } from 'src/presentation/dto/users/request/change-nickname.request';
import { ChangeTagRequest } from 'src/presentation/dto/users/request/change-tag.request';
import { GetUserResponse } from 'src/presentation/dto/users/response/get-user.response';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userReader: UserReader,
    ) {}

    @UseGuards(AuthGuard)
    @Get(':id')
    async getUser(@Param('id') userId: string): Promise<GetUserResponse> {
        return await this.userReader.readProfile(userId);
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
