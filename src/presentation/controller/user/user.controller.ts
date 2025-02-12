import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserService } from 'src/domain/services/user/user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
}
