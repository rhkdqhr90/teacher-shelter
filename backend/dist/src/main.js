"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const nest_winston_1 = require("nest-winston");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path = __importStar(require("path"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const prisma_exception_filter_1 = require("./common/filters/prisma-exception.filter");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useLogger(app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER));
    const configService = app.get(config_1.ConfigService);
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(), new http_exception_filter_1.HttpExceptionFilter(), new prisma_exception_filter_1.PrismaExceptionFilter());
    const isProduction = process.env.NODE_ENV === 'production';
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        hsts: isProduction
            ? { maxAge: 31536000, includeSubDomains: true, preload: true }
            : false,
    }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, compression_1.default)({ threshold: 1024 }));
    app.set('trust proxy', 1);
    app.enableCors({
        origin: configService.get('cors.origins'),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    if (process.env.NODE_ENV !== 'production') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('교사쉼터 API')
            .setDescription('특수교사, 보육교사를 위한 커뮤니티 API 문서')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'Authorization',
            description: 'JWT 토큰을 입력하세요',
            in: 'header',
        }, 'access-token')
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
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
            },
        });
    }
    app.useStaticAssets(path.join(process.cwd(), 'uploads', 'profile'), {
        prefix: '/uploads/profile/',
    });
    app.useStaticAssets(path.join(process.cwd(), 'uploads', 'post'), {
        prefix: '/uploads/post/',
    });
    app.useStaticAssets(path.join(process.cwd(), 'uploads', 'banner'), {
        prefix: '/uploads/banner/',
    });
    app.enableShutdownHooks();
    const port = configService.getOrThrow('port');
    await app.listen(port);
    const logger = app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER);
    logger.log(`🚀 Server running on http://localhost:${port}/api`, 'Bootstrap');
    logger.log(`📝 Environment: ${process.env.NODE_ENV}`, 'Bootstrap');
    if (process.env.NODE_ENV !== 'production') {
        logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
    }
}
bootstrap().catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map