import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser);
    await app.listen(3000);
}
bootstrap();
