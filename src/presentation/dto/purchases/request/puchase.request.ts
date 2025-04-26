import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class PurchaseRequest {
    @ApiProperty({
        description: '구매할 상품 UUID 배열',
        example: [
            '550e8400-e29b-41d4-a716-446655440000',
            'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        ],
        type: [String],
        maxItems: 20,
    })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsNotEmpty({ each: true })
    @ArrayMaxSize(20)
    readonly productIds: string[];
}
