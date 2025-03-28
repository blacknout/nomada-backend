import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    // Log the incoming request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Capture response data
    const oldSend = res.send;
    res.send = function (data: any) {
        // Log the response
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] Response sent in ${duration}ms`);
        console.log('Status:', res.statusCode);
        
        // Call the original send function
        return oldSend.apply(res, [data]);
    };
    
    next();
};
