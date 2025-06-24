import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsUrl,
    Min,
    Max,
    Length,
    IsArray,
    ArrayMaxSize,
    ArrayMinSize,
} from 'class-validator';

export class CreateIslandRequest {
    @ApiProperty({ minimum: 1, maximum: 5 })
    @IsNumber()
    @Min(1)
    @Max(5)
    readonly maxMembers: number;

    @ApiProperty({
        minLength: 1,
        maxLength: 50,
        example: '멋진 섬 다들 들어와',
    })
    @Length(1, 50)
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ minLength: 1, maxLength: 200, example: '여긴 멋진 섬이야' })
    @Length(1, 200)
    @IsString()
    readonly description: string;

    @ApiProperty({ example: 'https://island-image.com' })
    @IsString()
    @IsUrl()
    readonly coverImage: string;

    @ApiProperty({ example: '자유' })
    @Length(1, 10, { each: true })
    @IsArray()
    @ArrayMaxSize(3)
    @ArrayMinSize(1)
    readonly tags: string[];

    @ApiProperty({ example: 'island' })
    @Length(1, 50)
    @IsString()
    readonly mapKey: string;
}
