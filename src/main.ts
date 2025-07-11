import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'https://mitarea-0rtj.onrender.com', // URL de tu frontend en Render
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
