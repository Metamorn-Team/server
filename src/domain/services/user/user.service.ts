import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/interface/user.repository';

@Injectable()
export class UserService {
    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
    ) {}
}
