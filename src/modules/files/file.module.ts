import { Module } from '@nestjs/common';
import { S3Module } from 'src/infrastructure/aws/s3/s3.module';
import { FileController } from 'src/presentation/controller/files/file.controller';

@Module({
    imports: [S3Module],
    controllers: [FileController],
})
export class FileModule {}
