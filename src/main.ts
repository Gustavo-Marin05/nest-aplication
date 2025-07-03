import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());



  app.enableCors({
    origin: true, // Cambia esto al URL de tu frontend
    credentials: true,               // Permite enviar cookies en peticiones
  });



  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
