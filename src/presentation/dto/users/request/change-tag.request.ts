import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class ChangeTagRequest {
    @ApiProperty()
    @Length(5, 50)
    readonly tag: string;
}
