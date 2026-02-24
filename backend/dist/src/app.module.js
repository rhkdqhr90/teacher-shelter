"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const configuration_1 = __importDefault(require("./config/configuration"));
const validation_schema_1 = require("./config/validation.schema");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const database_module_1 = require("./database/database.module");
const redis_module_1 = require("./redis/redis.module");
const nest_winston_1 = require("nest-winston");
const winston_config_1 = require("./config/winston.config");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const posts_module_1 = require("./posts/posts.module");
const comments_module_1 = require("./comments/comments.module");
const notifications_module_1 = require("./notifications/notifications.module");
const uploads_module_1 = require("./uploads/uploads.module");
const reports_module_1 = require("./reports/reports.module");
const admin_module_1 = require("./admin/admin.module");
const answers_module_1 = require("./answers/answers.module");
const applications_module_1 = require("./applications/applications.module");
const verifications_module_1 = require("./verifications/verifications.module");
const inquiries_module_1 = require("./inquiries/inquiries.module");
const announcements_module_1 = require("./announcements/announcements.module");
const banners_module_1 = require("./banners/banners.module");
const csrf_middleware_1 = require("./common/middleware/csrf.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(csrf_middleware_1.CsrfMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.POST }, { path: '*', method: common_1.RequestMethod.PUT }, { path: '*', method: common_1.RequestMethod.PATCH }, { path: '*', method: common_1.RequestMethod.DELETE });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            nest_winston_1.WinstonModule.forRoot(winston_config_1.winstonConfig),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validationSchema: validation_schema_1.validationSchema,
                validationOptions: {
                    abortEarly: false,
                },
            }),
            database_module_1.DatabaseModule,
            redis_module_1.RedisModule,
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        name: 'default',
                        ttl: (config.get('throttle.ttl') || 60) * 1000,
                        limit: config.get('throttle.limit') || 300,
                    },
                    {
                        name: 'strict',
                        ttl: 15 * 60 * 1000,
                        limit: 30,
                    },
                    {
                        name: 'medium',
                        ttl: 60 * 1000,
                        limit: 60,
                    },
                ],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            posts_module_1.PostsModule,
            comments_module_1.CommentsModule,
            notifications_module_1.NotificationsModule,
            uploads_module_1.UploadsModule,
            reports_module_1.ReportsModule,
            admin_module_1.AdminModule,
            answers_module_1.AnswersModule,
            applications_module_1.ApplicationsModule,
            verifications_module_1.VerificationsModule,
            inquiries_module_1.InquiriesModule,
            announcements_module_1.AnnouncementsModule,
            banners_module_1.BannersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map