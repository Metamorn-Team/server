import { Length } from 'class-validator';

export class ChangeNicknameRequest {
    @Length(2, 20)
    readonly nickname: string;
}
