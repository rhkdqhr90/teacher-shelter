// Deploy trigger v3
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Winston을 기본 Logger로 교체
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService = app.get(ConfigService);

  // Filters
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(),
  );

  // Security
  const isProduction = process.env.NODE_ENV === 'production';
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // 정적 파일 CORS 허용
      hsts: isProduction
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false, // 프로덕션에서만 HSTS 활성화
    }),
  );
  app.use(cookieParser());

  // Compression: 응답 크기 1KB 이상일 때 gzip 압축
  app.use(compression({ threshold: 1024 }));

  // ✅ Trust proxy: 프록시 환경에서 실제 클라이언트 IP 추출
  app.set('trust proxy', 1);

  // CORS
  app.enableCors({
    origin: configService.get('cors.origins'),
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefix
  app.setGlobalPrefix('api');

  // Swagger API Documentation (개발/스테이징 환경에서만)
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('교사쉼터 API')
      .setDescription('특수교사, 보육교사를 위한 커뮤니티 API 문서')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'JWT 토큰을 입력하세요',
          in: 'header',
        },
        'access-token',
      )
      .addCookieAuth('refreshToken', {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
      })
      .addTag('Auth', '인증 관련 API')
      .addTag('Users', '사용자 관련 API')
      .addTag('Posts', '게시글 관련 API')
      .addTag('Comments', '댓글 관련 API')
      .addTag('Notifications', '알림 관련 API')
      .addTag('Reports', '신고 관련 API')
      .addTag('Applications', '지원서 관련 API')
      .addTag('Verifications', '인증 관련 API')
      .addTag('Admin', '관리자 API')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // Static files (uploads) - verification 폴더는 제외 (보안상 별도 엔드포인트로 제공)
  app.useStaticAssets(path.join(process.cwd(), 'uploads', 'profile'), {
    prefix: '/uploads/profile/',
  });
  app.useStaticAssets(path.join(process.cwd(), 'uploads', 'post'), {
    prefix: '/uploads/post/',
  });
  app.useStaticAssets(path.join(process.cwd(), 'uploads', 'banner'), {
    prefix: '/uploads/banner/',
  });

  // ✅ Graceful Shutdown: 컨테이너 환경에서 안전한 종료 보장
  // SIGTERM/SIGINT 시 진행 중인 요청 완료 후 DB 연결 해제
  app.enableShutdownHooks();

  const port = configService.getOrThrow<number>('port');
  await app.listen(port);

  // Winston Logger 사용
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`🚀 Server running on http://localhost:${port}/api`, 'Bootstrap');
  logger.log(`📝 Environment: ${process.env.NODE_ENV}`, 'Bootstrap');
  if (process.env.NODE_ENV !== 'production') {
    logger.log(
      `📚 Swagger docs: http://localhost:${port}/api/docs`,
      'Bootstrap',
    );
  }
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
