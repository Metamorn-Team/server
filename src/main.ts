import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import { setupSwagger } from 'src/configs/swagger/setup-swagger';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(cookieParser());
    setupSwagger(app);
    await app.listen(3000);
}
bootstrap();
