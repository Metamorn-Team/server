import * as Joi from 'joi';

export const validationSchema = Joi.object({
    // DB
    DATABASE_URL: Joi.string().required(),

    // Redis
    REDIS_PORT: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_TLS: Joi.string().required(),

    // JWT
    JWT_SECRET_KEY: Joi.string().required(),
    ACCESS_TOKEN_TIME: Joi.string().required(),
    REFRESH_TOKEN_TIME: Joi.string().required(),
    REFRESH_COOKIE_TIME: Joi.number().required(),

    // AWS S3
    AWS_BUCKET_REGION: Joi.string().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    AWS_BUCKEY_NAME: Joi.string().required(),

    // AWS Cloudwatch
    CLOUDWATCH_LOG_GROUP: Joi.string().required(),
    CLOUDWATCH_LOG_STREAM: Joi.string().required(),
    CLOUDWATCH_REGION: Joi.string().required(),
    CLOUDWATCH_KEY_ID: Joi.string().required(),
    CLOUDWATCH_SECRET_KEY: Joi.string().required(),
});
