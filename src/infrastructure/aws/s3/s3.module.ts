import { Module } from '@nestjs/common';
import { S3PresignedManager } from 'src/infrastructure/aws/s3/s3-presigned-manager';

@Module({
    providers: [S3PresignedManager],
    exports: [S3PresignedManager],
})
export class S3Module {}
