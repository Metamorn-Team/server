import { transports, format } from 'winston';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';
import * as Transport from 'winston-transport';

const isProduction = process.env.NODE_ENV === 'production';

const transportList: Transport[] = [];

if (isProduction) {
    transportList.push(
        new WinstonCloudWatch({
            logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
            logStreamName: process.env.CLOUDWATCH_LOG_STREAM,
            awsRegion: process.env.CLOUDWATCH_REGION,
            awsAccessKeyId: process.env.CLOUDWATCH_KEY_ID,
            awsSecretKey: process.env.CLOUDWATCH_SECRET_KEY,
            level: 'info',
            messageFormatter: ({ level, message }) => {
                return `[${level}] : ${JSON.stringify(message)}}`;
            },
            awsOptions: {
                credentials: {
                    accessKeyId: String(process.env.CLOUDWATCH_KEY_ID),
                    secretAccessKey: String(process.env.CLOUDWATCH_SECRET_KEY),
                },
                region: process.env.CLOUDWATCH_REGION,
            },
        }),
    );
} else {
    transportList.push(
        new transports.Console({
            level: 'silly',
            format: format.combine(
                format.json(),
                format.timestamp(),
                format.ms(),
                format.printf(({ level, message, timestamp, ...meta }) => {
                    return `${timestamp as string} [${level.toUpperCase()}] ${JSON.stringify(
                        message,
                        null,
                        2,
                    )} ${JSON.stringify(meta)}`;
                }),
            ),
        }),
    );
}

export const windstonOptions: WinstonModuleOptions = {
    level: isProduction ? 'info' : 'silly',
    format: format.json(),
    transports: transportList,
};

export const winstonLogger = WinstonModule.createLogger(windstonOptions);
