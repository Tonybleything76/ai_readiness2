import pino from 'pino';

// Configuration for Pino logger with sensitive field redaction
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      // Authentication and security related fields
      'authorization',
      'password',
      'token',
      'accessToken', 
      'refreshToken',
      'secret',
      'apiKey',
      'csrf_token',
      // Request headers that may contain sensitive data
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-csrf-token"]',
      // Response headers that may contain sensitive data
      'res.headers["set-cookie"]',
      // Request body fields that may contain sensitive data
      'req.body.password',
      'req.body.token',
      'req.body.secret',
      // Query parameters that may contain sensitive data
      'req.query.token',
      'req.query.secret',
      'req.query.password',
    ],
    censor: '[REDACTED]'
  },
  // Pretty printing in development
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname'
      }
    }
  })
};

// Create the main logger instance
export const logger = pino(loggerConfig);

// Express middleware for request logging
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  // Log request start
  logger.info({
    req: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      // Only log body for non-GET requests and if it's not too large
      ...(req.method !== 'GET' && req.body && JSON.stringify(req.body).length < 1000 && {
        body: req.body
      })
    }
  }, 'Request started');

  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - start;
    
    // Log response
    logger.info({
      req: {
        method: req.method,
        url: req.url
      },
      res: {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        // Only log response body for errors or if it's small
        ...(res.statusCode >= 400 || JSON.stringify(body).length < 500 ? { body } : {})
      },
      duration
    }, 'Request completed');

    return originalJson.call(this, body);
  };

  next();
};

// Helper function for backwards compatibility with existing log calls
export const log = (message: string, verbose?: boolean) => {
  if (verbose && process.env.NODE_ENV !== 'development') {
    return;
  }
  logger.info(message);
};