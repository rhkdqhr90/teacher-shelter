"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
let PrismaExceptionFilter = PrismaExceptionFilter_1 = class PrismaExceptionFilter extends core_1.BaseExceptionFilter {
    logger = new common_1.Logger(PrismaExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Database error';
        const isProduction = process.env.NODE_ENV === 'production';
        switch (exception.code) {
            case 'P2002':
                status = common_1.HttpStatus.CONFLICT;
                message = isProduction
                    ? 'Resource already exists'
                    : `Unique constraint failed on ${exception.meta?.target}`;
                break;
            case 'P2025':
                status = common_1.HttpStatus.NOT_FOUND;
                message = 'Resource not found';
                break;
            case 'P2003':
                status = common_1.HttpStatus.BAD_REQUEST;
                message = isProduction
                    ? 'Invalid reference'
                    : 'Foreign key constraint failed';
                break;
            default:
                message = isProduction ? 'Database error' : exception.message;
        }
        this.logger.error(`Prisma Error [${exception.code}]: ${exception.message}`, exception.stack);
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            ...(isProduction ? {} : { path: request.url, method: request.method }),
            message,
        });
    }
};
exports.PrismaExceptionFilter = PrismaExceptionFilter;
exports.PrismaExceptionFilter = PrismaExceptionFilter = PrismaExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(client_1.Prisma.PrismaClientKnownRequestError)
], PrismaExceptionFilter);
//# sourceMappingURL=prisma-exception.filter.js.map