import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

@Injectable()
export class S3PresignedManager {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor() {
        this.s3Client = new S3Client({
            region: String(process.env.AWS_BUCKET_REGION),
            credentials: {
                accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
                secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
            },
        });
        this.bucketName = String(process.env.AWS_BUCKEY_NAME);
    }

    async getPresignedUrl(path: string, expiresIn = 300) {
        const key = `${path}/${v4()}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: 'image/*',
        });

        const presignedUrl = await getSignedUrl(this.s3Client, command, {
            expiresIn,
        });
        return {
            presignedUrl,
            key,
        };
    }

    // async getPresignedUrls(path: string, count: number, expiresIn = 300) {
    //     const result = [];
    //     for (let i = 0; i < count; i++) {
    //         const url = await this.getPresignedUrl(path, expiresIn);
    //         result.push(url);
    //     }

    //     return result;
    // }
}
