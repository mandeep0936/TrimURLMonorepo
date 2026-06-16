import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
}

export function createError(message: string, statusCode: number): ApiError {
  const err: ApiError = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? 500;
  res.status(status).json({
    error: {
      message: err.message ?? "Internal server error",
      status,
    },
  });
}
