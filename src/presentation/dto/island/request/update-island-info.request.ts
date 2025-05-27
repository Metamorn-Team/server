import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    Length,
    Max,
    Min,
} from 'class-validator';
import { CreateIslandRequest } from '../../game/request/create-island.request';

export class UpdateIslandInfoRequest extends PartialType(
    OmitType(CreateIslandRequest, ['tags'] as const),
) {
    @ApiProperty()
    @IsUUID(4)
    id: string;

    @ApiProperty({ minimum: 1, maximum: 5 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    readonly maxMembers?: number;

    @ApiProperty({
        minLength: 1,
        maxLength: 50,
        example: '멋진 섬 다들 들어와',
    })
    @IsOptional()
    @Length(1, 50)
    @IsNotEmpty()
    readonly name?: string;

    @ApiProperty({ minLength: 1, maxLength: 200, example: '여긴 멋진 섬이야' })
    @IsOptional()
    @Length(1, 200)
    @IsString()
    readonly description?: string;

    @ApiProperty({ example: 'https://island-image.com' })
    @IsOptional()
    @IsString()
    @IsUrl()
    readonly coverImage?: string;
}
