import pino from 'pino';
import { appConfig } from '../config';

const transport = appConfig.env !== 'production' 
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    })
  : pino.destination(appConfig.logging.file);

export const logger = pino({
  level: appConfig.logging.level,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
}, transport);

export const createModuleLogger = (module: string) => {
  return logger.child({ module });
};