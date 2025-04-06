import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('Metamorn docs')
        .setDescription('메타몬 API 문서')
        .setVersion('1.0')
        .addTag('metamorn')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
};
