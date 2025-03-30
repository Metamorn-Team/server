import { Module } from '@nestjs/common';
import { UserController } from 'src/presentation/controller/users/users.controller';
import { UserService } from 'src/domain/services/users/users.service';
import { UserComponentModule } from 'src/modules/users/users-component.module';

@Module({
    imports: [UserComponentModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
