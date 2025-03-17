import { Length } from 'class-validator';

export class ChangeTagRequest {
    @Length(5, 50)
    readonly tag: string;
}
