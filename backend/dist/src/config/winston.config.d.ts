import * as winston from 'winston';
import 'winston-daily-rotate-file';
export declare const winstonConfig: {
    transports: (import("winston-daily-rotate-file") | winston.transports.ConsoleTransportInstance)[];
};
