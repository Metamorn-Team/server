import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserService } from 'src/domain/services/user/user.service';
import { ChangeNicknameRequest } from 'src/presentation/dto/user/request/change-nickname.request';
import { ChangeTagRequest } from 'src/presentation/dto/user/request/change-tag.request';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

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
