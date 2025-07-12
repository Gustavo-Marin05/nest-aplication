import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'https://mitarea-0rtj.onrender.com',
    credentials: true,
  });

  // Accede a la instancia subyacente de Express
  const expressApp = app.getHttpAdapter().getInstance();

  // Servir los archivos estáticos de React
  expressApp.use(express.static(join(__dirname, '..', 'dist')));

  // Redirigir cualquier otra ruta al index.html de React
  expressApp.get('*', (req: Request, res: Response) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
