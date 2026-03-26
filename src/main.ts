import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');

  // --- SWAGGER SETUP ---
  const config = new DocumentBuilder()
    .setTitle('EmpowHerHub API')
    .setDescription('The API documentation and testing hub for EmpowHerHub')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('users')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  // Adding clear console logs so you know exactly where everything is running!
  console.log(`\n`);
  console.log(`Application is successfully running!`);
  console.log(`Local server URL: http://localhost:${port}`);
  console.log(`Swagger Dashboard: http://localhost:${port}/api`);
  console.log(`\n`);
}
bootstrap();
