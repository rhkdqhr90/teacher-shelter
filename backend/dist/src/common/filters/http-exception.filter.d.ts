import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly isProduction;
    catch(exception: HttpException, host: ArgumentsHost): void;
}
