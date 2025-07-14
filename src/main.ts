import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Middleware CORS global manual (recomendado en Render)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://frontend-nest-getiontareas.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
  });

  // Habilitar CORS oficial NestJS (complementario)
  app.enableCors({
    origin: 'https://frontend-nest-getiontareas.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
