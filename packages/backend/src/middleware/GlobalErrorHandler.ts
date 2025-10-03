import { Request, Response, NextFunction } from "express"; "express"

export class AppError extends Error {
    constructor(public message: string, public statusCode?: number, public  isOperational = true) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }
}
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;

    res.status(statusCode).send({
        status: statusCode < 500 ? "fail" : "error",
        message: isOperational ? err.message : "internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack } || {})
    })

    if (!isOperational && process.env.NODE_ENV === "production") process.exit(1);
}
