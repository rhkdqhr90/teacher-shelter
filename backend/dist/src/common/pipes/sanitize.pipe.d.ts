import { PipeTransform } from '@nestjs/common';
export declare class SanitizePipe implements PipeTransform {
    transform(value: any): any;
    private sanitizeString;
    private sanitizeObject;
}
