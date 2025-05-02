import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { S3PresignedManager } from 'src/infrastructure/aws/s3/s3-presigned-manager';
import { GetPresignedUrlRequest } from 'src/presentation/dto/files/request/get-presigned-url.request';
import { GetPresignedUrlResponse } from 'src/presentation/dto/files/response/get-presigned-url.response';

@Controller('files')
export class FileController {
    constructor(private readonly s3PresignedManager: S3PresignedManager) {}

    @ApiOperation({ summary: 'presigned url 생성' })
    @ApiResponse({
        status: 200,
        description: '생성 성공',
        type: GetPresignedUrlResponse,
    })
    @Get()
    async getPresignedUrl(@Query() dto: GetPresignedUrlRequest) {
        return await this.s3PresignedManager.getPresignedUrl(dto.path);
    }
}
