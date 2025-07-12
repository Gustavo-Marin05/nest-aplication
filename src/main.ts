import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json()); // 👈 Asegura que el body sea leído correctamente
  app.use(cookieParser());

  app.enableCors({
    origin: 'https://mitarea-0rtj.onrender.com', // 👈 sin barra al final
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
