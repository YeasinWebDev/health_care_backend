import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

// Define a custom error interface for better type safety
interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  meta?: {};
}

const globalErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error;

  // Handle different types of errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "Duplicate field value entered";
      error = err.meta?.target as string[];
    } else if (err.code === "P1000") {
      statusCode = 403;
      message = "Authentication failed";
      error = err.meta?.target as string[];
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Validation error";
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 400;
    message = "Bad request";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 400;
    message = "Prisma client initialization error";
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === "production") {
    error = {
      name: err.name,
      message: message,
      ...(err.isOperational && { stack: err.stack }),
    };
  }

  res.status(statusCode).json({
    success,
    message,
    error: err.meta,
    // error: {
    //   name: err.name,
    //   message: err.message,
    //   ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    // },
    // ...(process.env.NODE_ENV === "development" && {
    //   stack: err.stack,
    // }),
  });
};

export default globalErrorHandler;
