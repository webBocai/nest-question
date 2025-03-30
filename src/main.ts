import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransfromInterceptor } from './transfrom/transfrom.interceptor';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new TransfromInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  await app.listen(process.env.PORT ?? 8003);
}
bootstrap();
