import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum Varient {
    TAG = 'TAG',
    NICKNAME = 'NICKNAME',
}

export class SearchUsersRequest {
    @IsString()
    readonly search: string;

    @IsEnum(Varient)
    readonly varient: Varient;

    @IsString()
    @IsOptional()
    readonly cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    readonly limit?: number = 10;
}
