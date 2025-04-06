import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum Varient {
    TAG = 'TAG',
    NICKNAME = 'NICKNAME',
}

export class SearchUsersRequest {
    @ApiProperty()
    @IsString()
    readonly search: string;

    @ApiProperty({ enum: Varient })
    @IsEnum(Varient)
    readonly varient: Varient;

    @ApiProperty()
    @IsString()
    @IsOptional()
    readonly cursor?: string;

    @ApiProperty()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    readonly limit?: number = 10;
}
