import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import { setupSwagger } from 'src/configs/swagger/setup-swagger';
import { winstonLogger } from 'src/configs/winston/winston-options';
import { MessagePackIoAdapter } from 'src/presentation/gateway/adapter/msg-pack-adapter';
import * as Sentry from '@sentry/node';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sendDefaultPii: true,
});

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: winstonLogger,
    });

    const wsAdapter = new MessagePackIoAdapter(app);

    app.enableCors({ origin: true, credentials: true });
    app.use(cookieParser());
    app.useWebSocketAdapter(wsAdapter);
    setupSwagger(app);

    await app.listen(3000);
}
bootstrap();
