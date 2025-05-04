import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import morgan from 'morgan';
import { IncomingMessage, ServerResponse } from 'http';

// Custom interface for Request with _startTime
interface CustomIncomingMessage extends IncomingMessage {
  _startTime?: [number, number];
}

// Create a custom stream for morgan that uses our Winston logger
const stream = {
  write: (message: string) => {
    // Remove trailing newline
    const msg = message.trim();
    logger.http(msg);
  }
};

// Create a custom token for response time
morgan.token('response-time', (req: CustomIncomingMessage, res: ServerResponse) => {
  if (!req._startTime) {
    return '';
  }
  
  // Make sure req._startTime is the expected format (array of two numbers)
  if (Array.isArray(req._startTime) && req._startTime.length === 2) {
    const diff = process.hrtime(req._startTime);
    const time = diff[0] * 1000 + diff[1] / 1000000;
    return time.toFixed(2);
  }
  
  // Fallback in case _startTime is in an unexpected format
  return '';
});

// Morgan format string
const morganFormat = ':remote-addr :method :url :status :response-time ms - :res[content-length]';

// Create the Morgan middleware with our custom stream
export const httpLogger = morgan(morganFormat, { stream });

// Custom detailed request logger middleware
export const detailedRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Explicitly create a proper hrtime tuple
  (req as unknown as CustomIncomingMessage)._startTime = process.hrtime();
  
  // Log request details at debug level, appropriate for development environments
  logger.debug(`Request: ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  // Capture response data
  const originalSend = res.send;
  
  res.send = function(body: any) {
    const duration = Date.now() - start;
    const size = body ? Buffer.byteLength(body instanceof Buffer ? body : String(body)) : 0;
    
    // Log response details at debug level
    logger.debug(`Response: ${res.statusCode} (${duration}ms, ${size} bytes)`, {
      headers: res.getHeaders(),
      body: typeof body === 'object' ? '[Object]' : body?.toString()?.substring(0, 200) // Avoid logging large responses
    });
    
    return originalSend.apply(res, [body]);
  };
  
  next();
};

// Combined middleware for production and development
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Use Morgan for basic HTTP logging (good for production)
  httpLogger(req, res, (err: Error | null) => {
    if (err) return next(err);
    
    // In development, also add detailed request logging
    if (process.env.NODE_ENV !== 'production') {
      detailedRequestLogger(req, res, next);
    } else {
      next();
    }
  });
};
