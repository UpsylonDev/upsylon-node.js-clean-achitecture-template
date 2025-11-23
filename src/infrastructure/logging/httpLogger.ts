import pinoHttp from 'pino-http';
import { stdSerializers } from 'pino';
import { Environment } from '../config/environment';

/**
 * HTTP logger middleware using pino-http.
 * Automatically logs all HTTP requests and responses with timing information.
 */
export function createHttpLogger() {
  const isDevelopment = Environment.isDevelopment();
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

  return pinoHttp({
    level: logLevel,
    ...(isDevelopment && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      },
    }),
    serializers: {
      req: (req) => {
        if (isDevelopment) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { headers, ...rest } = stdSerializers.req(req);
          return rest;
        }
        return stdSerializers.req(req);
      },
      res: (res) => {
        if (isDevelopment) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { headers, ...rest } = stdSerializers.res(res);
          return rest;
        }
        return stdSerializers.res(res);
      },
    },
    customReceivedMessage(req) {
      return `${req.method} ${req.url}`;
    },
    customSuccessMessage(req, res) {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage(req, res, error) {
      return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`;
    },
    autoLogging: {
      ignore: (req) => {
        if (!req.url) return false;
        return req.url.includes('/health') || req.url.includes('/metrics');
      },
    },
  });
}
