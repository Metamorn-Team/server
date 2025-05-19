import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Length, Min, ValidateIf } from 'class-validator';

export class GetLiveIslandListReqeust {
    @ApiProperty()
    @Min(0)
    readonly page: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    readonly limit?: number;

    @ApiProperty({ example: '자유' })
    @ValidateIf((_, value) => value !== null && value !== undefined)
    @Length(2, 10)
    readonly tag?: string | null;
}
